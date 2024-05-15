import { Markup } from 'telegraf'
import { logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherGroupKeywordUnsubscription,
  deletePublisherSubscription,
  insertPublisherGroupKeywordUnsubscription,
  insertPublisherSubscription,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, callbackData } from '../constants'
import { isCallbackButton, isCommonMessage } from '../typeguards'
import { TTelegrafContext } from '../types'
import { i18n } from '../i18n'

export const handleGroupKeywordAction = async (
  ctx: TTelegrafContext,
  command: EKeywordAction,
  channelId: number,
  keyword: string,
  keywordGroup: string,
) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  if (command === EKeywordAction.DELETE) {
    const db = await getDbConnection()
    await deletePublisherSubscription(db, channelId, [keyword])
    await insertPublisherGroupKeywordUnsubscription(db, channelId, keyword)
    await db.close()
    logUserAction(ctx, {
      info: `Unsubscribe from a group keyword`,
      keyword,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    const db = await getDbConnection()
    await insertPublisherSubscription(db, [
      {
        channelId,
        keyword,
      },
    ])
    await deletePublisherGroupKeywordUnsubscription(db, channelId, keyword)
    await db.close()
    logUserAction(ctx, {
      info: `Subscribe to a group keyword`,
      keyword,
    })
  } else {
    throw new Error(`Unknown operation in keywordGroup button: «${command}» for ${channelId}`)
  }

  const callbackForUnsubscribe = callbackData.premoderationGroupKeywordsButton(
    EKeywordAction.DELETE,
    channelId,
    keyword,
    keywordGroup,
  )
  const callbackForSubscribe = callbackData.premoderationGroupKeywordsButton(
    EKeywordAction.SUBSCRIBE,
    channelId,
    keyword,
    keywordGroup,
  )
  const oldCallback =
    command === EKeywordAction.DELETE ? callbackForUnsubscribe : callbackForSubscribe
  const newCallback =
    command === EKeywordAction.DELETE ? callbackForSubscribe : callbackForUnsubscribe
  const newText =
    command === EKeywordAction.DELETE
      ? i18n['ru'].button.premoderationKeywordFromGroupSubscribe(keyword, keywordGroup)
      : i18n['ru'].button.premoderationKeywordFromGroupSubscribe(keyword, keywordGroup)
  await replaceInlineKeyboardButton(ctx, {
    [oldCallback]: Markup.button.callback(newText, newCallback),
  })
}
