import process from 'process'
import { SessionStore, Telegraf, session } from 'telegraf'
import { message } from 'telegraf/filters'
import { getLogger } from '../utils/index.js'
import {
  GenericMenu,
} from 'telegraf-menu'
import { MySQL } from '@telegraf/session/mysql'
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
    // store: MySQL({
    //   host: process.env.DB_HOST,
    //   port: Number(process.env.DB_PORT),
    //   database: process.env.DB_DATABASE,
    //   user: process.env.DB_USER,
    //   password: process.env.DB_PASSWORD,
    //   table: 'telegraf_publisher_sessions'
    // })
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

// @ts-expect-error
bot.command(EState.KEYWORD_SETTINGS, keywordSettingsMenu)
bot.action(
  new RegExp(EState.KEYWORD_SETTINGS),
  GenericMenu.onAction((ctx: TCurrentCtx) => ctx.session.keyboardMenu, keywordSettingsMenu)
)

bot.on(message('text'), async (ctx) => {
  console.log(ctx);
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
