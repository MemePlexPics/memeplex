import { Markup } from 'telegraf'
import { enterToState, logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deleteBotTopicKeywordUnsubscription,
  deleteBotSubscription,
  insertBotTopicKeywordUnsubscription,
  insertBotSubscription,
  selectBotKeywordByIds,
  selectBotTopicNameByIds,
  deleteBotKeyword,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, callbackData } from '../constants'
import type { TTelegrafContext } from '../types'
import { i18n } from '../i18n'
import type { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'
import { buyPremiumState } from '../states'

export const handleTopicKeywordAction = async (
  ctx: TTelegrafContext<Update.CallbackQueryUpdate<CallbackQuery>>,
  command: EKeywordAction,
  channelId: number,
  keywordId: number,
  topicId: number,
  doUpdateButtons?: boolean,
) => {
  const hasPremiumSubscription = await ctx.hasPremiumSubscription
  const db = await getDbConnection()
  const [topic] = await selectBotTopicNameByIds(db, [topicId])
  if (!hasPremiumSubscription && command === EKeywordAction.DELETE) {
    await enterToState(ctx, buyPremiumState)
    return
  }
  const [keyword] = await selectBotKeywordByIds(db, [keywordId])
  if (command === EKeywordAction.DELETE) {
    await deleteBotSubscription(db, channelId, [keywordId])
    await deleteBotKeyword(db, keyword.keyword)
    await insertBotTopicKeywordUnsubscription(db, [
      {
        channelId,
        keywordId,
      },
    ])
    await logUserAction(ctx, {
      info: `Unsubscribe from a topic keyword`,
      keywordId,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    const db = await getDbConnection()
    await insertBotSubscription(db, [
      {
        channelId,
        keywordId,
      },
    ])
    await deleteBotTopicKeywordUnsubscription(db, channelId, [keywordId])
    await logUserAction(ctx, {
      info: `Subscribe to a topic keyword`,
      keywordId,
    })
  } else {
    await db.close()
    throw new Error(`Unknown operation in topic button: «${command}» for ${channelId}`)
  }
  await db.close()

  if (doUpdateButtons === false) {
    return
  }
  const callbackForUnsubscribe = callbackData.premoderation.topicKeywordsButton(
    EKeywordAction.DELETE,
    channelId,
    keywordId,
    topicId,
  )
  const callbackForSubscribe = callbackData.premoderation.topicKeywordsButton(
    EKeywordAction.SUBSCRIBE,
    channelId,
    keywordId,
    topicId,
  )
  const oldCallback =
    command === EKeywordAction.DELETE ? callbackForUnsubscribe : callbackForSubscribe
  const newCallback =
    command === EKeywordAction.DELETE ? callbackForSubscribe : callbackForUnsubscribe
  const newText =
    command === EKeywordAction.DELETE
      ? i18n['ru'].button.premoderation.keywordFromTopic.subscribe(keyword.keyword, topic.name)
      : i18n['ru'].button.premoderation.keywordFromTopic.unsubscribe(
        hasPremiumSubscription,
        keyword.keyword,
        topic.name,
      )
  await replaceInlineKeyboardButton(ctx, {
    [oldCallback]: Markup.button.callback(newText, newCallback),
  })
}
