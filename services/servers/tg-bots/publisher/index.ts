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

type CurrentCtx = DefaultCtx & {
  session: {
    keyboardMenu: GenericMenu
  }
}

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
          table: 'telegraf_sessions',
      }),
  }),
);

bot.use(GenericMenu.middleware())

enum MenuAction {
  BASKET = 'basket',
  VIDEO_FILTERS = 'video_filters',
  LANGUAGE = 'language',
  START = 'start'
}

const START_MENU_FILTERS: MenuFilters<MenuAction> = [
  new KeyboardButton('basket', MenuAction.BASKET),
  new KeyboardButton('videoFilters', MenuAction.VIDEO_FILTERS),
  new KeyboardButton('language', MenuAction.LANGUAGE)
]

const initStartMenu = (ctx: CurrentCtx) => {
  new RegularMenu<CurrentCtx, MenuAction>({
    action: MenuAction.START,
    message: 'menu.start.start',
    filters: START_MENU_FILTERS,
    replaceable: true,
    debug: true,
    menuGetter: (menuCtx) => menuCtx.session.keyboardMenu,
    menuSetter: (menuCtx, menu) => (menuCtx.session.keyboardMenu = menu),
    onChange(changeCtx, state) {
      console.log(state)
      switch (state) {
        case MenuAction.BASKET:
        // return initBasketMenu(changeCtx);

        case MenuAction.LANGUAGE:
        // return initLanguageMenu(changeCtx);

        case MenuAction.VIDEO_FILTERS:
        // return initVideoFiltersMenu(changeCtx);
      }
    }
  }).sendMenu(ctx)
}

// @ts-expect-error
bot.command(MenuAction.START, initStartMenu)
bot.action(
  new RegExp(MenuAction.START),
  GenericMenu.onAction(
    (ctx: CurrentCtx) => ctx.session.keyboardMenu,
    initStartMenu
  )
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
