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
import { i18n } from './i18n'
import { TSessionInMemory, TTelegrafContext, TTelegrafSession } from './types'

const bot = new Telegraf<TTelegrafContext>(process.env.TELEGRAM_BOT_TOKEN)
const logger = getLogger('tg-bot')
const { client } = await connectToElastic(logger)

const sessionInMemory: TSessionInMemory = {}

bot.use(
  session({
    defaultSession: () => defaultSession,
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

bot.use(
  rateLimit({
    window: 60_000,
    limit: 15,
    onLimitExceeded: async ctx => {
      logUserAction(ctx.from, { info: 'exceeded rate limit' }, logger)
      await ctx.reply(i18n['ru'].message.rateLimit())
    },
  }),
)

bot.start(async ctx => {
  await ctx.reply(i18n['ru'].message.start())
  logUserAction(ctx.from, { start: ctx.payload || 1 }, logger)
})

bot.command('help', async ctx => {
  await ctx.reply(i18n['ru'].message.start())
})

bot.command('get_latest', ctx => onBotCommandGetLatest(ctx, true, client, logger))

bot.command('suggest_channel', ctx => onBotCommandSuggestChannel(ctx, logger))

bot.action('button_search_more', ctx => onBotRecieveText(ctx, client, logger))

bot.action('button_latest_older', ctx => onBotCommandGetLatest(ctx, false, client, logger))

bot.action('button_latest_newer', ctx => onBotCommandGetLatest(ctx, true, client, logger))

bot.on(message('text'), async ctx => {
  resetSearchSession(ctx)
  await onBotRecieveText(ctx, client, logger)
  const isTooLong = /(\s+[^ ]+){3,}/.test(ctx.update.message.text) // 4+ words
  const isContainRedundantWords = [
    'мем',
    'видео',
    'фото',
    'картинка',
    'где',
    'из',
    'reels',
    'рилс',
  ].some(word => new RegExp('(^|\\s)' + word + '(\\s|$)', 'iu').test(ctx.update.message.text))
  if (isTooLong || isContainRedundantWords) {
    const aviceText = [
      isContainRedundantWords ? i18n['ru'].message.doNotAddToQuery() : undefined,
      isTooLong ? i18n['ru'].message.shortQueriesWorkBetter() : undefined,
    ]
      .filter(el => el)
      .join('\n')
    await ctx.reply(`
${i18n['ru'].message.questinableQueryAdvice()}
${aviceText}`)
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
      () => onInlineQuery(ctx, page, client, sessionInMemory, logger),
      500,
    )
  } else await onInlineQuery(ctx, page, client, sessionInMemory, logger)
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
  bot.telegram.setMyCommands([
    {
      command: 'get_latest',
      description: i18n['ru'].command.getLatest(),
    },
    {
      command: 'suggest_channel',
      description: i18n['ru'].command.suggestChannel(),
    },
    {
      command: 'help',
      description: i18n['ru'].command.help(),
    },
  ])
  logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}

await start()
