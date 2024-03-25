import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { getLogger } from '../utils'
import { EState } from './constants'
import { TState, TTelegrafContext } from './types'
import { enterToState } from './utils'
import { addChannelState, addKeywordsState, channelSelectState, channelSettingState, keywordSettingsState, mainState } from './states'

const bot = new Telegraf<TTelegrafContext>(process.env.TELEGRAM_PUBLISHER_BOT_TOKEN, { telegram: { webhookReply: false } })
const logger = getLogger('tg-publisher-bot')

bot.use(
  session({
    defaultSession: () => ({
      channel: undefined,
      state: EState.MAIN
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
  await enterToState(ctx, mainState)
})

bot.on('callback_query', async (ctx) => {
  // @ts-expect-error
  const callbackQuery = ctx.update.callback_query.data
  await states[ctx.session.state].onCallback(ctx, callbackQuery)
  const message = states[ctx.session.state].message?.(ctx)
  if (message) ctx.reply(message)
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
}

await start()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
