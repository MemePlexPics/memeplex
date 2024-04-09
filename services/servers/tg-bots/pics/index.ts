import process from 'process'
import 'dotenv/config'
import { connectToElastic } from '../../../../utils'
import { Telegraf, session } from 'telegraf'
import { MySQL } from '@telegraf/session/mysql'
import { message } from 'telegraf/filters'
import rateLimit from 'telegraf-ratelimit'
import { logUserAction, resetSearchSession } from './utils'
import {
  onBotCommandGetLatest,
  onBotCommandSuggestChannel,
  onBotRecieveText,
  onInlineQuery,
} from './handlers'
import { defaultSession } from './constants'
import { getLogger } from '../utils'

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const logger = getLogger('tg-bot')
const { client } = await connectToElastic(logger)

bot.use(
  session({
    defaultSession: () => defaultSession,
    store: MySQL({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      table: 'telegraf_sessions',
    }),
  }),
)

bot.use(
  rateLimit({
    window: 60_000,
    limit: 15,
    onLimitExceeded: async ctx => {
      logUserAction(ctx.from, { info: 'exceeded rate limit' }, logger)
      await ctx.reply('Wait a few seconds before trying again')
    },
  }),
)

bot.start(async ctx => {
  await ctx.reply(
    `Welcome to [MemePlex](https://memeplex.pics)!

Send me a text to search memes by caption.`,
    { parse_mode: 'Markdown' },
  )
  logUserAction(ctx.from, { start: ctx.payload || 1 }, logger)
})

bot.command('get_latest', ctx => onBotCommandGetLatest(ctx, true, client, logger))

bot.command('suggest_channel', ctx => onBotCommandSuggestChannel(ctx, logger))

bot.action('button_search_more', ctx => onBotRecieveText(ctx, client, logger))

bot.action('button_latest_older', ctx => onBotCommandGetLatest(ctx, false, client, logger))

bot.action('button_latest_newer', ctx => onBotCommandGetLatest(ctx, true, client, logger))

bot.on(message('text'), async ctx => {
  resetSearchSession(ctx)
  await onBotRecieveText(ctx, client, logger)
})

const sessionInline = {}

bot.on('inline_query', async ctx => {
  if (!sessionInline[ctx.inlineQuery.from.id]) {
    sessionInline[ctx.inlineQuery.from.id] = {}
  }
  const page = Number(ctx.inlineQuery.offset) || 1
  if (sessionInline[ctx.inlineQuery.from.id]?.debounce) {
    clearTimeout(sessionInline[ctx.inlineQuery.from.id].debounce)
  }
  if (page === 1) {
    sessionInline[ctx.inlineQuery.from.id].debounce = setTimeout(
      () => onInlineQuery(ctx, page, client, sessionInline, logger),
      500,
    )
  } else await onInlineQuery(ctx, page, client, sessionInline, logger)
})

bot.on('chosen_inline_result', async ctx => {
  const { query, result_id } = ctx.update.chosen_inline_result
  logUserAction(
    ctx.update.chosen_inline_result.from,
    {
      inline_select: {
        query,
        id: result_id,
      },
    },
    logger,
  )
})

const start = async () => {
  bot.launch({
    webhook: {
      domain: process.env.MEMEPLEX_WEBSITE_DOMAIN,
      path: '/' + process.env.TELEGRAM_BOT_WEBHOOK_PATH,
      port: 3081,
    },
  })
  logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

await start()
