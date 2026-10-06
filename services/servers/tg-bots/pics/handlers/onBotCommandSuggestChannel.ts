import type { CommandContextExtn } from 'telegraf/typings/telegram-types'
import { getDbConnection, getTgChannelName } from '../../../../../utils'
import { insertChannelSuggestion } from '../../../../../utils/mysql-queries'
import { getTranslation } from '../i18n'
import type { TTelegrafContext } from '../types'
import { logUserAction } from '../utils'

export const onBotCommandSuggestChannel = async (ctx: TTelegrafContext & CommandContextExtn) => {
  const { payload } = ctx
  const channelName = getTgChannelName(payload.trim())
  if (!channelName) {
    return ctx.reply(getTranslation(ctx.from.language_code).message.channelSuggestion.format())
  }
  const db = await getDbConnection()
  const response = await insertChannelSuggestion(db, channelName)
  await db.close()
  if (response) {
    await logUserAction(ctx, { info: `suggested @${channelName}` })
  }
  return ctx.reply(getTranslation(ctx.from.language_code).message.channelSuggestion.thanks())
}
