import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
import rateLimit from 'telegraf-ratelimit'
import { MySQL } from '@telegraf/session/mysql'
import { message } from 'telegraf/filters'
import { getLogger, getTelegramUser } from '../utils'
import { EState } from './constants'
import { TState, TTelegrafContext, TTelegrafSession } from './types'
import {
  enterToState,
  getMenuButtonsAndHandlers,
  handleCallbackQuery,
  handleDistributionQueue,
  logUserAction,
} from './utils'
import {
  addChannelState,
  addKeywordsState,
  channelSelectState,
  channelSettingState,
  keywordGroupSelectState,
  keywordSettingsState,
  mainState,
} from './states'
import {
  InfoMessage,
  getDbConnection,
  getElasticClient,
  logError,
  logInfo,
} from '../../../../utils'
import { loopRetrying } from '../../../../utils'
import { CYCLE_SLEEP_TIMEOUT, LOOP_RETRYING_DELAY } from '../../../../constants'
import { insertPublisherUser } from '../../../../utils/mysql-queries'

const bot = new Telegraf<TTelegrafContext>(process.env.TELEGRAM_PUBLISHER_BOT_TOKEN, {
  telegram: { webhookReply: false },
})
global.logger = getLogger('tg-publisher-bot')
const elastic = await getElasticClient()

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

bot.use(
  rateLimit({
    window: 3_000,
    limit: 3,
    onLimitExceeded: async ctx => {
      logUserAction(ctx.from, { info: 'exceeded rate limit' })
      await ctx.reply('Wait a few seconds before trying again')
    },
  }),
)

const states: Record<EState, TState> = {
  [EState.ADD_CHANNEL]: addChannelState,
  [EState.ADD_KEYWORDS]: addKeywordsState,
  [EState.CHANNEL_SELECT]: channelSelectState,
  [EState.CHANNEL_SETTINGS]: channelSettingState,
  [EState.KEYWORD_SETTINGS]: keywordSettingsState,
  [EState.KEYWORD_GROUP_SELECT]: keywordGroupSelectState,
  [EState.MAIN]: mainState,
}

bot.start(async ctx => {
  await ctx.reply(`
    Добро пожаловать в MemePlex Publisher!

    Здесь вы можете подписать ваш канал, или себя, на ключевые слова мемов.
    Как только у нас появится мем, содержащий указанное вами ключевое слово, мы перешлем его в текущий чат.

    Для добавления канала боту необходимо предоставить административные права, чтобы он мог отправлять сообщения от лица канала.
    Перед отправкой в канал вам необходимо будет одобрить отправку мема в текущем чате, нажав кнопку подтверждения.
  `)
  await enterToState(ctx, mainState)

  const db = await getDbConnection()
  await insertPublisherUser(db, {
    id: ctx.from.id,
    user: getTelegramUser(ctx.from).user,
    timestamp: Date.now() / 1000,
  })
  await db.close()
  logUserAction(ctx.from, {
    start: ctx.payload || 1,
  })
})

bot.command('menu', async ctx => {
  await enterToState(ctx, states[ctx.session.state])
})

bot.on('callback_query', async ctx => {
  try {
    await handleCallbackQuery(ctx, elastic, states[ctx.session.state].onCallback)
    await ctx.answerCbQuery()
  } catch (error) {
    if (error instanceof InfoMessage) {
      await logInfo(global.logger, error)
    } else {
      await logError(global.logger, error, { ctx })
    }
  }
})

bot.on(message('text'), async ctx => {
  const text = ctx.update.message.text
  if (states[ctx.session.state].menu) {
    const { onTextHandlers } = await getMenuButtonsAndHandlers(ctx, states[ctx.session.state])
    const handler = onTextHandlers[text]
    if (handler) {
      await handler(ctx, text)
      return
    }
  }
  await states[ctx.session.state].onText?.(ctx, text)
})

bot.catch(async (err, ctx) => {
  const error =
    err instanceof Error
      ? err
      : {
        name: 'Unknown error',
        message: JSON.stringify(err),
      }
  await logError(global.logger, error, { ctx: JSON.stringify(ctx.update) })
  bot.stop()
})

const start = async () => {
  bot.launch({
    webhook: {
      domain: process.env.MEMEPLEX_WEBSITE_DOMAIN,
      path: '/' + process.env.TELEGRAM_PUBLISHER_BOT_WEBHOOK_PATH,
      port: 3082,
    },
  })
  bot.telegram.setMyCommands([
    {
      command: 'menu',
      description: 'Вызвать текущее меню',
    },
  ])
  bot.telegram.setMyDescription(`
    Это description
  `)
  bot.telegram.setMyShortDescription(`
    Это short description
  `)
  global.logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))

  await loopRetrying(async () => handleDistributionQueue(bot, global.logger), {
    logger: global.logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
  })
}

await start()
