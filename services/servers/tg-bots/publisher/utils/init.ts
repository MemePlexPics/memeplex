import process from 'process'
import 'dotenv/config'
import type { Telegraf } from 'telegraf'
import { session } from 'telegraf'
import rateLimit from 'telegraf-ratelimit'
import { MySQL } from '@telegraf/session/mysql'
import { message } from 'telegraf/filters'
import { getLogger, getTelegramUser } from '../../utils'
import { EState } from '../constants'
import type { TSessionInMemory, TState, TTelegrafContext, TTelegrafSession } from '../types'
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
  topicSettingState,
  keywordSettingsState,
  mainState,
  memeSearchState,
} from '../states'
import {
  InfoMessage,
  getDbConnection,
  getElasticClient,
  logError,
  logInfo,
  loopRetrying,
} from '../../../../../utils'
import { insertBotUser, selectBotPremiumUser } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import type { Logger } from 'winston'
import { CYCLE_SLEEP_TIMEOUT, LOOP_RETRYING_DELAY } from '../../../../../constants'
import {
  handleMemeSearchRequest,
  onBotCommandGetLatest,
  onBotCommandSuggestChannel,
  onInlineQuery,
} from '../handlers'

export const init = async (
  token: string,
  options: Partial<Telegraf.Options<TTelegrafContext>>,
  logger: Logger = getLogger('tg-publisher-bot'),
) => {
  const bot = new TelegrafWrapper<TTelegrafContext>(token, options)
  const elastic = await getElasticClient()

  // TODO: move into ctx
  const sessionInMemory: TSessionInMemory = {}

  bot.use(async (ctx, next) => {
    if (!ctx.logger) {
      ctx.logger = logger
    }
    if (!ctx.elastic) {
      ctx.elastic = elastic
    }
    Object.defineProperty(ctx, 'hasPremiumSubscription', {
      async get() {
        if (ctx.session.premiumUntil && ctx.session.premiumUntil > Date.now() / 1000) {
          return true
        }
        const db = await getDbConnection()
        const userPremium = await selectBotPremiumUser(db, ctx.from?.id)
        await db.close()
        if (userPremium.length === 0) {
          return false
        }
        ctx.session.premiumUntil = userPremium[0].untilTimestamp
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
        search: {
          nextPage: null,
          query: null,
        },
        latest: {
          pagesLeft: undefined,
          from: undefined,
          to: undefined,
        },
      }),
      store: MySQL<TTelegrafSession>({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        table: 'telegraf_sessions',
      }),
    }),
  )

  if (process.env.ENVIRONMENT !== 'TESTING') {
    bot.use(
      rateLimit<TTelegrafContext>({
        window: 3_000,
        limit: 3,
        onLimitExceeded: async (ctx: TTelegrafContext) => {
          await logUserAction(ctx, { info: 'exceeded rate limit' })
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
    [EState.TOPIC_SETTINGS]: topicSettingState,
    [EState.MAIN]: mainState,
    [EState.MEME_SEARCH]: memeSearchState,
  }

  bot.start(async ctx => {
    await ctx.reply(i18n['ru'].message.start())
    await enterToState(ctx, mainState)

    const db = await getDbConnection()
    await insertBotUser(db, {
      id: ctx.from.id,
      user: getTelegramUser(ctx.from).user,
      timestamp: Date.now() / 1000,
    })
    await db.close()
    await logUserAction(ctx, {
      start: ctx.payload || 1,
    })
  })

  bot.command('menu', async ctx => {
    const reappliableState =
      ctx.session.state === EState.MEME_SEARCH ? states[EState.MAIN] : states[ctx.session.state]
    await enterToState(ctx, reappliableState)
  })

  bot.command('help', async ctx => {
    await ctx.reply(i18n['ru'].message.help(), {
      parse_mode: 'Markdown',
    })
  })

  bot.command('get_latest', ctx => onBotCommandGetLatest(ctx, true))

  bot.command('suggest_channel', ctx => onBotCommandSuggestChannel(ctx))

  bot.on('callback_query', async ctx => {
    try {
      await handleCallbackQuery(ctx, states[ctx.session.state].onCallback)
      await ctx.answerCbQuery()
    } catch (error) {
      if (error instanceof InfoMessage) {
        await logInfo(ctx.logger, error)
      } else if (error instanceof Error) {
        await logError(ctx.logger, error, { update: ctx.update })
      }
    }
  })

  bot.on('inline_query', async ctx => {
    if (!sessionInMemory[ctx.inlineQuery.from.id]) {
      sessionInMemory[ctx.inlineQuery.from.id] = {}
    }
    const page = Number(ctx.inlineQuery.offset) || 1
    if (sessionInMemory[ctx.inlineQuery.from.id]?.debounce) {
      clearTimeout(sessionInMemory[ctx.inlineQuery.from.id].debounce)
    }
    if (page === 1) {
      sessionInMemory[ctx.inlineQuery.from.id].debounce = setTimeout(
        () => onInlineQuery(ctx, page, sessionInMemory),
        500,
      )
    } else await onInlineQuery(ctx, page, sessionInMemory)
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
    await handleMemeSearchRequest(ctx)
  })

  bot.catch(async (err, ctx) => {
    const error =
      err instanceof Error
        ? err
        : {
          name: 'Unknown error',
          message: JSON.stringify(err),
        }
    // In case we catch errors when sending messages
    try {
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
