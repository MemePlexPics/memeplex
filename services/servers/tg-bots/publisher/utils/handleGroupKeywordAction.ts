import { Markup } from 'telegraf'
import { logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherGroupKeywordUnsubscription,
  deletePublisherSubscription,
  insertPublisherGroupKeywordUnsubscription,
  insertPublisherSubscription,
  selectPublisherKeywordByIds,
  selectPublisherKeywordGroupByIds,
  selectPublisherKeywordGroupNameByIds,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, callbackData } from '../constants'
import type { TTelegrafContext } from '../types'
import { i18n } from '../i18n'

export const handleGroupKeywordAction = async (
  ctx: TTelegrafContext,
  command: EKeywordAction,
  channelId: number,
  keywordId: number,
  keywordGroupId: number,
) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  const db = await getDbConnection()
  const [keywordGroup] = await selectPublisherKeywordGroupByIds(db, [keywordGroupId])
  if (command === EKeywordAction.DELETE) {
    await deletePublisherSubscription(db, channelId, [keywordId])
    await insertPublisherGroupKeywordUnsubscription(db, [
      {
        channelId,
        keywordId,
      },
    ])
    logUserAction(ctx, {
      info: `Unsubscribe from a group keyword`,
      keywordId,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    const db = await getDbConnection()
    await insertPublisherSubscription(db, [
      {
        channelId,
        keywordId,
      },
    ])
    await deletePublisherGroupKeywordUnsubscription(db, channelId, [keywordId])
    logUserAction(ctx, {
      info: `Subscribe to a group keyword`,
      keywordId,
    })
  } else {
    await db.close()
    throw new Error(`Unknown operation in keywordGroup button: «${command}» for ${channelId}`)
  }
  const [group] = await selectPublisherKeywordGroupNameByIds(db, [keywordGroup.id])
  const [keyword] = await selectPublisherKeywordByIds(db, [keywordId])
  await db.close()

  const callbackForUnsubscribe = callbackData.premoderationGroupKeywordsButton(
    EKeywordAction.DELETE,
    channelId,
    keywordId,
    keywordGroupId,
  )
  const callbackForSubscribe = callbackData.premoderationGroupKeywordsButton(
    EKeywordAction.SUBSCRIBE,
    channelId,
    keywordId,
    keywordGroupId,
  )
  const oldCallback =
    command === EKeywordAction.DELETE ? callbackForUnsubscribe : callbackForSubscribe
  const newCallback =
    command === EKeywordAction.DELETE ? callbackForSubscribe : callbackForUnsubscribe
  const newText =
    command === EKeywordAction.DELETE
      ? i18n['ru'].button.premoderationKeywordFromGroupSubscribe(keyword.keyword, group.name)
      : i18n['ru'].button.premoderationKeywordFromGroupSubscribe(keyword.keyword, group.name)
  await replaceInlineKeyboardButton(ctx, {
    [oldCallback]: Markup.button.callback(newText, newCallback),
  })
}
