import { Markup } from 'telegraf'
import { logUserAction, replaceInlineKeyboardButton } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  deleteBotTopicSubscription,
  insertBotTopicSubscription,
  selectBotTopicNameByIds,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, ETopicAction, callbackData } from '../constants'
import type { TTelegrafContext } from '../types'
import { i18n } from '../i18n'
import type { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'

export const handleTopicAction = async (
  ctx: TTelegrafContext<Update.CallbackQueryUpdate<CallbackQuery>>,
  command: EKeywordAction,
  channelId: number,
  topicId: number,
) => {
  const db = await getDbConnection()
  const [topic] = await selectBotTopicNameByIds(db, [topicId])
  if (command === EKeywordAction.DELETE) {
    await deleteBotTopicSubscription(db, channelId, topicId)
    await logUserAction(ctx, {
      info: `Unsubscribe from a topic`,
      topic: topic.name,
    })
  } else if (command === EKeywordAction.SUBSCRIBE) {
    await insertBotTopicSubscription(db, [
      {
        channelId,
        topicId: topicId,
      },
    ])
    await logUserAction(ctx, {
      info: `Subscribe to a topic`,
      topic: topic.name,
    })
  } else {
    await db.close()
    throw new Error(`Unknown operation in topic button: «${command}» for ${channelId}`)
  }
  await db.close()

  const callbackForUnsubscribe = callbackData.premoderation.topicButton(
    ETopicAction.UNSUBSCRIBE,
    channelId,
    topicId,
  )
  const callbackForSubscribe = callbackData.premoderation.topicButton(
    ETopicAction.SUBSCRIBE,
    channelId,
    topicId,
  )
  const oldCallback =
    command === EKeywordAction.DELETE ? callbackForUnsubscribe : callbackForSubscribe
  const newCallback =
    command === EKeywordAction.DELETE ? callbackForSubscribe : callbackForUnsubscribe
  const newText =
    command === EKeywordAction.DELETE
      ? i18n['ru'].button.premoderation.topic.subscribe(topic.name)
      : i18n['ru'].button.premoderation.topic.unsubscribe(topic.name)

  await replaceInlineKeyboardButton(ctx, {
    [oldCallback]: Markup.button.callback(newText, newCallback),
  })
}
