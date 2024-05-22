import { Markup } from 'telegraf'
import { logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherGroupSubscription,
  insertPublisherGroupSubscription,
  selectPublisherKeywordGroupNameByIds,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, EKeywordGroupAction, callbackData } from '../constants'
import { TTelegrafContext } from '../types'
import { i18n } from '../i18n'

export const handleKeywordGroupAction = async (
  ctx: TTelegrafContext,
  command: EKeywordAction,
  channelId: number,
  keywordGroupId: number,
) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  const db = await getDbConnection()
  const [group] = await selectPublisherKeywordGroupNameByIds(db, [keywordGroupId])
  if (command === EKeywordAction.DELETE) {
    await deletePublisherGroupSubscription(db, channelId, keywordGroupId)
    logUserAction(ctx, {
      info: `Unsubscribe from a keyword group`,
      keywordGroup: group.name,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    await insertPublisherGroupSubscription(db, [
      {
        channelId,
        groupId: keywordGroupId,
      },
    ])
    logUserAction(ctx, {
      info: `Subscribe to a keyword group`,
      keywordGroup: group.name,
    })
  } else {
    await db.close()
    throw new Error(`Unknown operation in keywordGroup button: «${command}» for ${channelId}`)
  }
  await db.close()

  const callbackForUnsubscribe = callbackData.premoderationKeywordGroupButton(
    EKeywordGroupAction.UNSUBSCRIBE,
    channelId,
    keywordGroupId,
  )
  const callbackForSubscribe = callbackData.premoderationKeywordGroupButton(
    EKeywordGroupAction.SUBSCRIBE,
    channelId,
    keywordGroupId,
  )
  const oldCallback =
    command === EKeywordAction.DELETE ? callbackForUnsubscribe : callbackForSubscribe
  const newCallback =
    command === EKeywordAction.DELETE ? callbackForSubscribe : callbackForUnsubscribe
  const newText =
    command === EKeywordAction.DELETE
      ? i18n['ru'].button.premoderationKeywordGroupSubscribe(group.name)
      : i18n['ru'].button.premoderationKeywordGroupUnsubscribe(group.name)

  await replaceInlineKeyboardButton(ctx, {
    [oldCallback]: Markup.button.callback(newText, newCallback),
  })
}
