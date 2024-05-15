import { Markup } from 'telegraf'
import { logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deletePublisherSubscription,
  insertPublisherSubscription,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, callbackData } from '../constants'
import { TTelegrafContext } from '../types'
import { i18n } from '../i18n'

export const handleKeywordAction = async (
  ctx: TTelegrafContext,
  command: EKeywordAction,
  channelId: number,
  keyword: string,
) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  if (command === EKeywordAction.DELETE) {
    const db = await getDbConnection()
    await deletePublisherSubscription(db, channelId, [keyword])
    await db.close()
    logUserAction(ctx, {
      info: `Unsubscribe from a keyword`,
      keyword,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    const db = await getDbConnection()
    await insertPublisherSubscription(db, [
      {
        keyword,
        channelId,
      },
    ])
    await db.close()
  } else {
    throw new Error(`Unknown keyword operation «${command}» for ${channelId}`)
  }

  const callbackForUnsubscribe = callbackData.premoderationKeywordButton(
    EKeywordAction.DELETE,
    channelId,
    keyword,
  )
  const callbackForSubscribe = callbackData.premoderationKeywordButton(
    EKeywordAction.SUBSCRIBE,
    channelId,
    keyword,
  )
  const oldCallback =
    command === EKeywordAction.DELETE ? callbackForUnsubscribe : callbackForSubscribe
  const newCallback =
    command === EKeywordAction.DELETE ? callbackForSubscribe : callbackForUnsubscribe
  const newText =
    command === EKeywordAction.DELETE
      ? i18n['ru'].button.premoderationKeywordSubscribe(keyword)
      : i18n['ru'].button.premoderationKeywordUnsubscribe(keyword)

  await replaceInlineKeyboardButton(ctx, {
    [oldCallback]: Markup.button.callback(newText, newCallback),
  })
}
