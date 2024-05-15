import { Markup } from 'telegraf'
import { logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherGroupSubscription,
  insertPublisherGroupSubscription,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, callbackData } from '../constants'
import { TTelegrafContext } from '../types'
import { i18n } from '../i18n'

export const handleKeywordGroupAction = async (
  ctx: TTelegrafContext,
  command: EKeywordAction,
  channelId: number,
  keywordGroup: string,
) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  if (command === EKeywordAction.DELETE) {
    const db = await getDbConnection()
    await deletePublisherGroupSubscription(db, channelId, keywordGroup)
    await db.close()
    logUserAction(ctx, {
      info: `Unsubscribe from a keyword group`,
      keywordGroup,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    const db = await getDbConnection()
    await insertPublisherGroupSubscription(db, [
      {
        channelId,
        groupName: keywordGroup,
      },
    ])
    await db.close()
    logUserAction(ctx, {
      info: `Subscribe to a keyword group`,
      keywordGroup,
    })
  } else {
    throw new Error(`Unknown operation in keywordGroup button: «${command}» for ${channelId}`)
  }

  const callbackForUnsubscribe = callbackData.premoderationKeywordGroupButton(
    EKeywordAction.DELETE,
    channelId,
    keywordGroup,
  )
  const callbackForSubscribe = callbackData.premoderationKeywordGroupButton(
    EKeywordAction.SUBSCRIBE,
    channelId,
    keywordGroup,
  )
  const oldCallback =
    command === EKeywordAction.DELETE ? callbackForUnsubscribe : callbackForSubscribe
  const newCallback =
    command === EKeywordAction.DELETE ? callbackForSubscribe : callbackForUnsubscribe
  const newText =
    command === EKeywordAction.DELETE
      ? i18n['ru'].button.premoderationKeywordGroupSubscribe(keywordGroup)
      : i18n['ru'].button.premoderationKeywordGroupUnsubscribe(keywordGroup)

  await replaceInlineKeyboardButton(ctx, {
    [oldCallback]: Markup.button.callback(newText, newCallback),
  })
}
