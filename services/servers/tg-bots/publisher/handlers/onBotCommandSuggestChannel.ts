import { getDbConnection, getTgChannelName } from '../../../../../utils'
import { insertChannelSuggestion } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'
import { logUserAction } from '../utils'

export const onBotCommandSuggestChannel = async (ctx: TTelegrafContext) => {
  if (!('payload' in ctx) || typeof ctx.payload !== 'string') {
    throw new Error(`There is no payload in ctx!`)
  }
  const { payload } = ctx
  const channelName = getTgChannelName(payload.trim())
  if (!channelName) return ctx.reply(i18n['ru'].message.channelSuggestion.format())
  const db = await getDbConnection()
  const response = await insertChannelSuggestion(db, channelName)
  await db.close()
  if (response) logUserAction(ctx, { info: `suggested @${channelName}` })
  return ctx.reply(i18n['ru'].message.channelSuggestion.thanks())
}
