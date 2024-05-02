import process from 'process'
import 'dotenv/config'
import { Telegraf, session } from 'telegraf'
import rateLimit from 'telegraf-ratelimit'
import { MySQL } from '@telegraf/session/mysql'
import { message } from 'telegraf/filters'
import { getLogger, getTelegramUser } from '../../utils'
import { EState } from '../constants'
import { TState, TTelegrafContext, TTelegrafSession } from '../types'
import {
  enterToState,
  getMenuButtonsAndHandlers,
  handleCallbackQuery,
  logUserAction,
} from '../utils'
import {
  addChannelState,
  addKeywordsState,
  channelSelectState,
  channelSettingState,
  keywordGroupSelectState,
  keywordSettingsState,
  mainState,
  publicationWithSettingsState,
} from '../states'
import {
  InfoMessage,
  getDbConnection,
  getElasticClient,
  logError,
  logInfo,
} from '../../../../../utils'
import { insertPublisherUser } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'

export const init = async (token: string, options: Partial<Telegraf.Options<TTelegrafContext>>) => {
  const bot = new Telegraf<TTelegrafContext>(token, options)

  global.logger = getLogger('tg-publisher-bot')
  const elastic = await getElasticClient()

  bot.use(
    session({
      defaultSession: () => ({
        channel: undefined,
        state: EState.MAIN,
      }),
      store: MySQL<TTelegrafSession>({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        database: process.env.DB_DATABASE,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        table: 'telegraf_publisher_sessions',
      }),
    }),
  )

  bot.use(
    rateLimit({
      window: 3_000,
      limit: 3,
      onLimitExceeded: async (ctx: TTelegrafContext) => {
        logUserAction(ctx.from, { info: 'exceeded rate limit' })
        await ctx.reply(i18n['ru'].message.rateLimit())
      },
    }),
  )

  const states: Record<EState, TState> = {
    [EState.ADD_CHANNEL]: addChannelState,
    [EState.ADD_KEYWORDS]: addKeywordsState,
    [EState.CHANNEL_SELECT]: channelSelectState,
    [EState.CHANNEL_SETTINGS]: channelSettingState,
    [EState.KEYWORD_SETTINGS]: keywordSettingsState,
    [EState.KEYWORD_GROUP_SELECT]: keywordGroupSelectState,
    [EState.PUBLICATION_WITH_SETTINGS]: publicationWithSettingsState,
    [EState.MAIN]: mainState,
  }

  bot.start(async ctx => {
    await ctx.reply(i18n['ru'].message.start())
    await enterToState(ctx, mainState)

    const db = await getDbConnection()
    await insertPublisherUser(db, {
      id: ctx.from.id,
      user: getTelegramUser(ctx.from).user,
      timestamp: Date.now() / 1000,
    })
    await db.close()
    logUserAction(ctx.from, {
      start: ctx.payload || 1,
    })
  })

  bot.command('menu', async ctx => {
    await enterToState(ctx, states[ctx.session.state])
  })

  bot.on('callback_query', async ctx => {
    try {
      await handleCallbackQuery(ctx, elastic, states[ctx.session.state].onCallback)
      await ctx.answerCbQuery()
    } catch (error) {
      if (error instanceof InfoMessage) {
        await logInfo(global.logger, error)
      } else {
        await logError(global.logger, error, { update: ctx.update })
      }
    }
  })

  bot.on(message('text'), async ctx => {
    const text = ctx.update.message.text
    if (states[ctx.session.state].menu) {
      const { onTextHandlers } = await getMenuButtonsAndHandlers(ctx, states[ctx.session.state])
      const handler = onTextHandlers[text]
      if (handler) {
        await handler(ctx, text)
        return
      }
    }
    await states[ctx.session.state].onText?.(ctx, text)
  })

  bot.catch(async (err, ctx) => {
    const error =
      err instanceof Error
        ? err
        : {
          name: 'Unknown error',
          message: JSON.stringify(err),
        }
    await logError(global.logger, error, { ctx: JSON.stringify(ctx.update) })
  })

  return bot
}
