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
  onPhotoMessage,
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
import {
  insertBotInlineAction,
  insertBotUser,
  selectBotPremiumUser,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import type { Logger } from 'winston'
import { CYCLE_SLEEP_TIMEOUT, LOOP_RETRYING_DELAY, telegramChat } from '../../../../../constants'
import {
  handleIndexedMemeSuggestion,
  handleMemeSearchRequest,
  onBotCommandGetLatest,
  onBotCommandSetPremium,
  onBotCommandSuggestChannel,
  onInlineQuery,
} from '../handlers'
import { ADMIN_IDS } from '../../../../../constants/publisher'

export const init = async (
  token: string,
  options: Partial<Telegraf.Options<TTelegrafContext>>,
  logger: Logger = getLogger('tg-publisher-bot'),
) => {
  const bot = new TelegrafWrapper<TTelegrafContext>(token, options)
  const elastic = await getElasticClient()
  const sessionInMemory: Record<number, TSessionInMemory> = {}

  bot.use(async (ctx, next) => {
    ctx.logger ??= logger
    ctx.elastic ??= elastic
    Object.defineProperty(ctx, 'sessionInMemory', {
      get() {
        sessionInMemory[ctx.from.id] ??= {}
        return sessionInMemory[ctx.from.id]
      },
    })
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
        onLimitExceeded: async (ctx, next) => {
          if (ADMIN_IDS.includes(ctx.from.id)) {
            return next()
          }
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
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
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
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    const reappliableState =
      ctx.session.state === EState.MEME_SEARCH ? states[EState.MAIN] : states[ctx.session.state]
    await enterToState(ctx, reappliableState)
  })

  bot.command('help', async ctx => {
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    await ctx.reply(i18n['ru'].message.help(), {
      parse_mode: 'Markdown',
    })
  })

  bot.command('get_latest', async ctx => {
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    await onBotCommandGetLatest(ctx, true)
  })

  bot.command('suggest_channel', async ctx => {
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    await onBotCommandSuggestChannel(ctx)
  })

  bot.command('set_premium', async ctx => {
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    await onBotCommandSetPremium(ctx)
  })

  bot.on('callback_query', async ctx => {
    if (ctx.chat?.id && ![ctx.from.id, telegramChat.premoderation].includes(ctx.chat.id)) {
      return
    }
    await handleCallbackQuery(ctx, states[ctx.session.state]?.onCallback)
    await ctx.answerCbQuery()
  })

  bot.on('inline_query', async ctx => {
    const page = Number(ctx.inlineQuery.offset) || 1
    if (ctx.sessionInMemory.debounce) {
      clearTimeout(ctx.sessionInMemory.debounce)
    }
    if (page === 1) {
      ctx.sessionInMemory.debounce = setTimeout(() => onInlineQuery(ctx, page), 500)
    } else await onInlineQuery(ctx, page)
  })

  bot.on('chosen_inline_result', async ctx => {
    const { query, result_id } = ctx.update.chosen_inline_result
    const db = await getDbConnection()
    await insertBotInlineAction(db, {
      action: 'select',
      userId: ctx.from.id,
      query,
      selectedId: result_id,
    })
    await db.close()
    await logUserAction(ctx, {
      action: 'inline_select',
      query,
      id: result_id,
    })
  })

  bot.on(message('photo'), async ctx => {
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
    await onPhotoMessage(ctx)
    await ctx.reply(i18n['ru'].message.memeSuggested(), {
      reply_parameters: {
        message_id: ctx.update.message.message_id,
      },
    })
  })

  bot.on(message('text'), async ctx => {
    if (ctx.from.id !== ctx.chat.id) {
      return
    }
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
    if (err instanceof InfoMessage) {
      await logInfo(ctx.logger, err)
      return
    }
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
  handleIndexedMemeSuggestion(bot)

  return bot
}
