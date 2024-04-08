import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
import { MySQL } from '@telegraf/session/mysql'
import { message } from 'telegraf/filters'
import { getLogger, getTelegramUser } from '../utils'
import { EState } from './constants'
import { TStateObject, TTelegrafContext, TTelegrafSession } from './types'
import { enterToState, handleCallbackQuery, handleDistributionQueue } from './utils'
import {
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
const logger = getLogger('tg-publisher-bot')
const elastic = await getElasticClient()

bot.use(
  session({
    defaultSession: () => ({
      channel: undefined,
      state: EState.MAIN,
    }),
    // store: MySQL<TTelegrafSession>({
    //   host: process.env.DB_HOST,
    //   port: Number(process.env.DB_PORT),
    //   database: process.env.DB_DATABASE,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   table: 'telegraf_publisher_sessions',
    // }),
  }),
)

bot.use(
  session<TStateObject, TTelegrafContext, 'sessionInMemory'>({
    property: 'sessionInMemory',
  }),
)

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
})

// bot.command('menu', async (ctx) => {
//   await enterToState(ctx, () => ctx.sessionInMemory)
// })

bot.on('callback_query', async (ctx) => {
  console.log('cb', ctx)
  try {
    await handleCallbackQuery(ctx, elastic)
    await ctx.answerCbQuery()
  } catch (error) {
    if (error instanceof InfoMessage) {
      await logInfo(logger, error)
    } else {
      await logError(logger, error, { ctx })
    }
  }
})

bot.on(message('text'), async (ctx) => {
  console.log('text', ctx)
  if (!ctx.sessionInMemory?.onText) return void
  await ctx.sessionInMemory.onText(ctx, ctx.update.message.text)
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
    // {
    //   command: 'menu',
    //   description: 'Меню',
    // },
  ])
  bot.telegram.setMyDescription(`
    Это description
  `)
  bot.telegram.setMyShortDescription(`
    Это short description
  `)
  logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))

  await loopRetrying(async () => handleDistributionQueue(bot, logger), {
    logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
  })
}

await start()
