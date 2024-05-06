import { Logger } from 'winston'
import { getMysqlClient, getTgChannelName, logError } from '../../../../../utils'
import { insertChannelSuggestion } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { TTelegrafContext } from '../types'
import { logUserAction } from '../utils'

export const onBotCommandSuggestChannel = async (ctx: TTelegrafContext, logger: Logger) => {
  // @ts-expect-error payload doesn't exist
  const { payload } = ctx
  const channelName = getTgChannelName(payload.trim())
  if (!channelName) return ctx.reply(i18n['ru'].message.suggestionFormat())
  try {
    const mysql = await getMysqlClient()
    const response = await insertChannelSuggestion(mysql, channelName)
    await mysql.end()
    if (response) logUserAction(ctx.from, { info: `suggested @${channelName}` }, logger)
    return ctx.reply(i18n['ru'].message.suggestionThanks())
  } catch (e) {
    await logError(logger, e)
    await ctx.reply(i18n['ru'].message.error())
  }
}
