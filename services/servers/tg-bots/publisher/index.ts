import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
import { MySQL } from '@telegraf/session/mysql'
import { message } from 'telegraf/filters'
import { getLogger, getTelegramUser } from '../utils'
import { EState } from './constants'
import { TState, TTelegrafContext, TTelegrafSession } from './types'
import { enterToState, handleDistributionQueue } from './utils'
import { addChannelState, addKeywordsState, channelSelectState, channelSettingState, keywordSettingsState, mainState } from './states'
import { getDbConnection } from '../../../../utils'
import { botPublisherUsers } from '../../../../db/schema'
import { sql } from 'drizzle-orm'
import { loopRetrying } from '../../../../utils'
import { deletePublisherSubscription, selectPublisherChannelsByUserId } from '../../../../utils/mysql-queries'

const bot = new Telegraf<TTelegrafContext>(process.env.TELEGRAM_PUBLISHER_BOT_TOKEN, { telegram: { webhookReply: false } })
const logger = getLogger('tg-publisher-bot')

bot.use(
  session({
    defaultSession: () => ({
      channel: undefined,
      state: EState.MAIN
    }),
    store: MySQL<TTelegrafSession>({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        table: 'telegraf_publisher_sessions',
    }),
  })
)

const states: Record<EState, TState<EState>> = {
  [EState.ADD_CHANNEL]: addChannelState,
  [EState.ADD_KEYWORDS]: addKeywordsState,
  [EState.CHANNEL_SELECT]: channelSelectState,
  [EState.CHANNEL_SETTINGS]: channelSettingState,
  [EState.KEYWORD_SETTINGS]: keywordSettingsState,
  [EState.MAIN]: mainState,
}

bot.start(async (ctx) => {
  await ctx.reply(`
    Добро пожаловать в MemePlex Publisher!

    Здесь вы можете подписать ваш канал, или себя, на ключевые слова мемов.
    Как только у нас появится мем, содержащий указанное вами ключевое слово, мы перешлем его в текущий чат.

    Для добавления канала боту необходимо предоставить административные права, чтобы он мог отправлять сообщения от лица канала.
    Перед отправкой в канал вам необходимо будет одобрить отправку мема в текущем чате, нажав кнопку подтверждения.
  `)
  await enterToState(ctx, mainState)

  // TODO: move all orm queries into mysql-queris folder
  const db = await getDbConnection()
  await db.insert(botPublisherUsers).values({
    id: ctx.from.id,
    user: getTelegramUser(ctx.from),
    timestamp: Date.now() / 1000,
  }).onDuplicateKeyUpdate({ set: { id: sql`id` } })
})

bot.on('callback_query', async (ctx) => {
  // @ts-expect-error Property 'data' does not exist on type 'CallbackQuery'
  const callbackQuery = ctx.update.callback_query.data
  const [state, ...restCb] = callbackQuery.split('|')
  if (state === 'post') {
    await ctx.telegram.forwardMessage(restCb[0], ctx.chat.id, ctx.callbackQuery.message.message_id)
    await ctx.reply(`Мем успешно опубликован.`)
    return
  }

  if (state === 'key') {
    if (restCb[0] === 'del') {
      const keyword = restCb[1]
      const db = await getDbConnection()
      const userChannels = await selectPublisherChannelsByUserId(db, ctx.from.id)
      for (const channel of userChannels) {
        await deletePublisherSubscription(db, channel.id, keyword)
      }
      await ctx.reply(`Ключевое слово «${keyword}» успешно удалено.`)
    }
    return
  }

  await states[ctx.session.state].onCallback(ctx, callbackQuery)
})

bot.on(message('text'), async (ctx) => {
  await states[ctx.session.state].onText?.(ctx, ctx.update.message.text)
})

const start = async () => {
  bot.launch({
    webhook: {
      domain: process.env.MEMEPLEX_WEBSITE_DOMAIN,
      path: '/' + process.env.TELEGRAM_PUBLISHER_BOT_WEBHOOK_PATH,
      port: 3082
    }
  })
  logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))

  await loopRetrying(async () => handleDistributionQueue(bot, logger), {
    logger,
    afterCallbackDelayMs: 10_000,
    catchDelayMs: 10_000,
  })
}

await start()
