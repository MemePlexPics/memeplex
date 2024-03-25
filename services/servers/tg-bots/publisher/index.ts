import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { Keyboard, Key } from 'telegram-keyboard'
import { getLogger } from '../utils/index.js'
import { TCurrentCtx } from './types'
import { EState } from './constants'

const bot = new Telegraf<TCurrentCtx>(process.env.TELEGRAM_PUBLISHER_BOT_TOKEN, { telegram: { webhookReply: false } })
const logger = getLogger('tg-publisher-bot')

bot.use(
  session({
    defaultSession: () => ({
      keyboardMenu: undefined,
      channel: undefined,
      state: EState.MAIN
    }),
  })
)

const keyboards = {
  [EState.MAIN]: [
    Key.callback('Добавить канал', EState.ADD_CHANNEL),
    Key.callback('Настройки каналов', EState.CHANNEL_SETTINGS),
  ],
  [EState.ADD_CHANNEL]: [
    Key.callback('Назад', EState.MAIN),
  ],
  [EState.ADD_KEYWORDS]: [
    Key.callback('Добавить канал', EState.ADD_CHANNEL),
  ],
  [EState.CHANNEL_SELECT]: [
    ['first', 'second', 'third'].map(channel => Key.callback(channel, channel)),
    [
      Key.callback('Добавить канал', EState.ADD_CHANNEL)
    ],
  ],
  [EState.CHANNEL_SETTINGS]: [
    [
      Key.callback('Добавить ключевые слова', EState.ADD_KEYWORDS),
    ],
    [
      Key.callback('Редактировать ключевые слова', EState.ADD_KEYWORDS),
    ],
    [
      Key.callback('В главное меню', EState.MAIN),
    ],
  ],
  [EState.KEYWORD_SETTINGS]: [
    ['tits','peaches'].map(keyword => ([
      Key.callback(keyword, keyword),
      Key.callback('Del', `${keyword}|del`),
    ])),
    Key.callback('В главное меню', EState.MAIN),
  ],
}

bot.on(message('text'), async (ctx) => {
  // const { state } = ctx.session
  const text = ctx.update.message.text
  let state
  console.log(text)
  if (text[0] === '/') state = text.slice(1)
  const keyboard = Keyboard.make(keyboards[state ?? text])
  if (!keyboard) return
  await ctx.reply('Keyboard', keyboard.inline())
});

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
