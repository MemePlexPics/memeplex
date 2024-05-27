import type { Logger } from 'winston'
import { getDbConnection, getTgChannelName, logError } from '../../../../../utils'
import { insertChannelSuggestion } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'
import { logUserAction } from '../utils'

export const onBotCommandSuggestChannel = async (ctx: TTelegrafContext, logger: Logger) => {
  if (!('payload' in ctx) || typeof ctx.payload !== 'string') {
    throw new Error(`There is no payload in ctx!`)
  }
  const { payload } = ctx
  const channelName = getTgChannelName(payload.trim())
  if (!channelName) return ctx.reply(i18n['ru'].message.suggestionFormat())
  try {
    const db = await getDbConnection()
    const response = await insertChannelSuggestion(db, channelName)
    await db.close()
    if (response) logUserAction(ctx.from, { info: `suggested @${channelName}` }, logger)
    return ctx.reply(i18n['ru'].message.suggestionThanks())
  } catch (e) {
    await logError(logger, e)
    await ctx.reply(i18n['ru'].message.error())
  }
}
