import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
// import { MySQL } from '@telegraf/session/mysql';
// import { message } from 'telegraf/filters';
// import rateLimit from 'telegraf-ratelimit';
import { getLogger } from '../utils/index.js'
import {
  DefaultCtx,
  GenericMenu,
  KeyboardButton,
  MenuFilters,
  RegularMenu
} from 'telegraf-menu'
import { MySQL } from '@telegraf/session/mysql'
import { TCurrentCtx } from './types'
import { addChannelMenu, channelSelectMenu, channelSettingsMenu, mainMenu } from './menus'
import { EState } from './constants'

const bot = new Telegraf(process.env.TELEGRAM_PUBLISHER_BOT_TOKEN)
const logger = getLogger('tg-publisher-bot')

bot.use(
  session({
    defaultSession: () => ({}),
    store: MySQL({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      table: 'telegraf_publisher_sessions'
    })
  })
)

bot.use(GenericMenu.middleware())

// @ts-expect-error
bot.command(EState.MAIN, mainMenu)
bot.action(
  new RegExp(EState.MAIN),
  GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, mainMenu)
)
// @ts-expect-error
bot.command(EState.ADD_CHANNEL, addChannelMenu)
bot.action(
  new RegExp(EState.ADD_CHANNEL),
  GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, addChannelMenu)
)
// @ts-expect-error
bot.command(EState.CHANNEL_SELECT, channelSelectMenu)
bot.action(
  new RegExp(EState.CHANNEL_SELECT),
  GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, channelSelectMenu)
)
// @ts-expect-error
bot.command(EState.CHANNEL_SETTINGS, channelSettingsMenu)
bot.action(
  new RegExp(EState.CHANNEL_SETTINGS),
  GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, channelSettingsMenu)
)

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
