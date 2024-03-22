import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { Keyboard } from 'telegram-keyboard'
import { getLogger } from '../utils/index.js'
import {
  GenericMenu,
} from 'telegraf-menu'
import { TCurrentCtx } from './types'
import { addChannelMenu, channelSelectMenu, channelSettingsMenu, mainMenu } from './menus'
import { EState } from './constants'
import { keywordSettingsMenu } from './menus/keywordSettingsMenu.js'

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

// bot.use(GenericMenu.middleware())

// // @ts-expect-error
// bot.command(EState.MAIN, mainMenu)
// bot.action(
//   new RegExp(EState.MAIN),
//   // @ts-expect-error
//   GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, mainMenu)
// )

// // @ts-expect-error
// bot.command(EState.ADD_CHANNEL, addChannelMenu)
// bot.action(
  // new RegExp(EState.ADD_CHANNEL),
//   // @ts-expect-error
//   GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, addChannelMenu)
// )

// // @ts-expect-error
// bot.command(EState.CHANNEL_SELECT, channelSelectMenu)
// bot.action(
//   new RegExp(EState.CHANNEL_SELECT),
//   // @ts-expect-error
//   GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, channelSelectMenu)
// )

// // @ts-expect-error
// bot.command(EState.CHANNEL_SETTINGS, channelSettingsMenu)
// bot.action(
//   new RegExp(EState.CHANNEL_SETTINGS),
//   // @ts-expect-error
//   GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, channelSettingsMenu)
// )

// // @ts-expect-error
// bot.command(EState.KEYWORD_SETTINGS, keywordSettingsMenu)
// bot.action(
//   new RegExp(EState.KEYWORD_SETTINGS),
//   // @ts-expect-error
//   GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, keywordSettingsMenu)
// )

bot.on(message('text'), async (ctx) => {
  const { state } = ctx.session
  const text = ctx.update.message.text
  console.log(text, state)
  if (state === EState.ADD_CHANNEL) {
    ctx.session.channel = text
    return Keyboard.reply(['Button 1', 'Button 2'])
  }
  if (state === EState.CHANNEL_SELECT) {
    ctx.session.channel = text
    return Keyboard.reply(['Button 2', 'Button 3'])
  }
  if (state === EState.ADD_KEYWORDS) {
    await ctx.reply(`Данные ключевые слова приняты: ${text}`)
    return Keyboard.reply(['Button 3', 'Button 4'])
  }
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
