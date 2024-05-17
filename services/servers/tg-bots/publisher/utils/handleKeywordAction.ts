import { Markup } from 'telegraf'
import { logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherSubscription,
  insertPublisherSubscription,
  selectPublisherKeywordByIds,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, callbackData } from '../constants'
import { TTelegrafContext } from '../types'
import { i18n } from '../i18n'

export const handleKeywordAction = async (
  ctx: TTelegrafContext,
  command: EKeywordAction,
  channelId: number,
  keywordId: number,
) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  const db = await getDbConnection()
  const [keyword] = await selectPublisherKeywordByIds(db, [keywordId])
  if (command === EKeywordAction.DELETE) {
    await deletePublisherSubscription(db, channelId, [keywordId])
    logUserAction(ctx, {
      info: `Unsubscribe from a keyword`,
      keyword: keyword.keyword,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    await insertPublisherSubscription(db, [
      {
        keywordId,
        channelId,
      },
    ])
    logUserAction(ctx, {
      info: `Subscribe to a keyword`,
      keyword: keyword.keyword,
    })
  } else {
    await db.close()
    throw new Error(`Unknown keyword operation «${command}» for ${channelId}`)
  }
  await db.close()

  const callbackForUnsubscribe = callbackData.premoderationKeywordButton(
    EKeywordAction.DELETE,
    channelId,
    keywordId,
  )
  const callbackForSubscribe = callbackData.premoderationKeywordButton(
    EKeywordAction.SUBSCRIBE,
    channelId,
    keywordId,
  )
  const oldCallback =
    command === EKeywordAction.DELETE ? callbackForUnsubscribe : callbackForSubscribe
  const newCallback =
    command === EKeywordAction.DELETE ? callbackForSubscribe : callbackForUnsubscribe
  const newText =
    command === EKeywordAction.DELETE
      ? i18n['ru'].button.premoderationKeywordSubscribe(keyword.keyword)
      : i18n['ru'].button.premoderationKeywordUnsubscribe(keyword.keyword)

  await replaceInlineKeyboardButton(ctx, {
    [oldCallback]: Markup.button.callback(newText, newCallback),
  })
}
