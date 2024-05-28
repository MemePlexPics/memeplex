import { Markup } from 'telegraf'
import { logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deleteBotSubscription,
  insertBotSubscription,
  selectBotKeywordByIds,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, callbackData } from '../constants'
import type { TTelegrafContext } from '../types'
import { i18n } from '../i18n'
import type { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'

export const handleKeywordAction = async (
  ctx: TTelegrafContext<Update.CallbackQueryUpdate<CallbackQuery>>,
  command: EKeywordAction,
  channelId: number,
  keywordId: number,
) => {
  const db = await getDbConnection()
  const [keyword] = await selectBotKeywordByIds(db, [keywordId])
  if (command === EKeywordAction.DELETE) {
    await deleteBotSubscription(db, channelId, [keywordId])
    await logUserAction(ctx, {
      info: `Unsubscribe from a keyword`,
      keyword: keyword.keyword,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    await insertBotSubscription(db, [
      {
        keywordId,
        channelId,
      },
    ])
    await logUserAction(ctx, {
      info: `Subscribe to a keyword`,
      keyword: keyword.keyword,
    })
  } else {
    await db.close()
    throw new Error(`Unknown keyword operation «${command}» for ${channelId}`)
  }
  await db.close()

  const callbackForUnsubscribe = callbackData.premoderation.keywordButton(
    EKeywordAction.DELETE,
    channelId,
    keywordId,
  )
  const callbackForSubscribe = callbackData.premoderation.keywordButton(
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
