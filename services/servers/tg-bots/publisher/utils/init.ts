import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
import rateLimit from 'telegraf-ratelimit'
import { MySQL } from '@telegraf/session/mysql'
import { message } from 'telegraf/filters'
import { getLogger, getTelegramUser } from '../../utils'
import { EState } from '../constants'
import { TState, TTelegrafContext, TTelegrafSession } from '../types'
import {
  TelegrafWrapper,
  enterToState,
  getMenuButtonsAndHandlers,
  handleCallbackQuery,
  handleDistributionQueue,
  handleInvoiceQueue,
  handleNlpQueue,
  logUserAction,
} from '../utils'
import {
  addChannelState,
  buyPremiumState,
  channelSettingState,
  keywordGroupSelectState,
  keywordSettingsState,
  mainState,
} from '../states'
import {
  InfoMessage,
  getDbConnection,
  getElasticClient,
  logError,
  logInfo,
  loopRetrying,
} from '../../../../../utils'
import { insertPublisherUser, selectPublisherPremiumUser } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { Logger } from 'winston'
import { CYCLE_SLEEP_TIMEOUT, LOOP_RETRYING_DELAY } from '../../../../../constants'

export const init = async (
  token: string,
  options: Partial<Telegraf.Options<TTelegrafContext>>,
  logger: Logger = getLogger('tg-publisher-bot'),
) => {
  const bot = new TelegrafWrapper<TTelegrafContext>(token, options)
  const elastic = await getElasticClient()

  bot.use(async (ctx, next) => {
    if (!ctx.logger) {
      ctx.logger = logger
    }
    Object.defineProperty(ctx, 'hasPremiumSubscription', {
      async get() {
        if (ctx.session.premiumUntil && ctx.session.premiumUntil > Date.now() / 1000) {
          return true
        }
        if (!ctx.from) {
          throw new Error('There is no ctx.from')
        }
        const db = await getDbConnection()
        const userPremium = await selectPublisherPremiumUser(db, ctx.from?.id)
        if (userPremium.length === 0) {
          return false
        }
        ctx.session.premiumUntil = userPremium[0]?.untilTimestamp
        return true
      },
    })
    next()
  })

  bot.use(
    session({
      defaultSession: () => ({
        channel: undefined,
        state: EState.MAIN,
      }),
      store: MySQL<TTelegrafSession>({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        table: 'telegraf_publisher_sessions',
      }),
    }),
  )

  if (process.env.ENVIRONMENT !== 'TESTING') {
    bot.use(
      rateLimit({
        window: 3_000,
        limit: 3,
        onLimitExceeded: async (ctx: TTelegrafContext) => {
          if (!ctx.from) {
            throw new Error('There is no ctx.from')
          }
          logUserAction(ctx, { info: 'exceeded rate limit' })
          await ctx.reply(i18n['ru'].message.rateLimit())
        },
      }),
    )
  }

  const states: Record<EState, TState> = {
    [EState.ADD_CHANNEL]: addChannelState,
    [EState.BUY_PREMIUM]: buyPremiumState,
    [EState.CHANNEL_SETTINGS]: channelSettingState,
    [EState.KEYWORD_SETTINGS]: keywordSettingsState,
    [EState.KEYWORD_GROUP_SELECT]: keywordGroupSelectState,
    [EState.MAIN]: mainState,
  }

  bot.start(async ctx => {
    await ctx.reply(i18n['ru'].message.start())
    await enterToState(ctx, mainState)

    const db = await getDbConnection()
    await insertPublisherUser(db, {
      id: ctx.from.id,
      user: getTelegramUser(ctx.from).user,
      timestamp: Date.now() / 1000,
    })
    await db.close()
    logUserAction(ctx, {
      start: ctx.payload || 1,
    })
  })

  bot.command('menu', async ctx => {
    await enterToState(ctx, states[ctx.session.state])
  })

  bot.command('help', async ctx => {
    await ctx.reply(i18n['ru'].message.start())
  })

  bot.on('callback_query', async ctx => {
    try {
      await handleCallbackQuery(ctx, elastic, states[ctx.session.state].onCallback)
      await ctx.answerCbQuery()
    } catch (error) {
      if (error instanceof InfoMessage) {
        await logInfo(ctx.logger, error)
      } else if (error instanceof Error) {
        await logError(ctx.logger, error, { update: ctx.update })
      }
    }
  })

  bot.on(message('text'), async ctx => {
    const text = ctx.update.message.text
    const state = states[ctx.session.state]
    if (state.menu) {
      const { onTextHandlers } = await getMenuButtonsAndHandlers(ctx, states[ctx.session.state])
      const handler = onTextHandlers[text]
      if (handler) {
        await handler(ctx, text)
        return
      }
    }
    if (state.onText) {
      await state.onText(ctx, text)
      return
    }
    await ctx.reply(i18n['ru'].message.unexpectedMessage())
  })

  bot.catch(async (err, ctx) => {
    const error =
      err instanceof Error
        ? err
        : {
          name: 'Unknown error',
          message: JSON.stringify(err),
        }
    try {
      // In case we catch errors when sending messages
      await ctx.reply(i18n['ru'].message.somethingWentWrongTryLater())
    } finally {
      await logError(ctx.logger, error, { ctx: JSON.stringify(ctx.update) })
    }
  })

  loopRetrying(() => handleNlpQueue(logger, bot.abortController.signal), {
    logger: logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
    abortSignal: bot.abortController.signal,
  })
  loopRetrying(() => handleDistributionQueue(bot, logger, bot.abortController.signal), {
    logger: logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
    abortSignal: bot.abortController.signal,
  })
  loopRetrying(() => handleInvoiceQueue(bot, logger, bot.abortController.signal), {
    logger: logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
    abortSignal: bot.abortController.signal,
  })

  return bot
}
