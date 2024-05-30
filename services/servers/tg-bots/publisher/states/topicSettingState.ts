import { ETopicAction, EState } from '../constants'
import type { TMenuButton, TState, TTelegrafContext } from '../types'
import { addSubscription, enterToState, logUserAction, replaceInlineKeyboardButton } from '../utils'
import { channelSettingState, memeSearchState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  deleteBotTopicSubscription,
  insertBotTopicSubscription,
  selectBotTopicIdSubscriptionsByUserId,
  selectBotKeywordByIds,
  selectBotTopicByNames,
  selectBotTopicNameByIds,
  selectBotTopicNames,
  deleteBotSubscription,
  deleteBotTopicKeywordUnsubscription,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { Markup } from 'telegraf'
import type { InlineKeyboardButton } from '@telegraf/types'

export const topicSettingState: TState = {
  stateName: EState.TOPIC_SETTINGS,
  inlineMenu: async ctx => {
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in topicSettingState`)
    }
    const db = await getDbConnection()
    const topics = await selectBotTopicNames(db)
    const userTopicsRaw = await selectBotTopicIdSubscriptionsByUserId(db, ctx.from.id)
    const userTopics = userTopicsRaw.reduce((acc, { topicId }) => {
      acc.add(topicId)
      return acc
    }, new Set<number>())
    await db.close()
    const text = `
${i18n['ru'].message.topicDescription()}
${
  ctx.session.channel.id === ctx.from.id
    ? i18n['ru'].message.youEditingSubscriptionsForUser()
    : i18n['ru'].message.youEditingSubscriptionsForChannel(ctx.session.channel.name)
}`

    const buttons: InlineKeyboardButton[][] = []
    topics.forEach(({ id, name }) => {
      if (!name) {
        return
      }
      const isSubscribed = userTopics.has(id)
      const buttonText = isSubscribed
        ? i18n['ru'].button.unsubscribeKeyword(name)
        : i18n['ru'].button.subscribeKeyword(name)
      const keyAction = isSubscribed ? ETopicAction.UNSUBSCRIBE : ETopicAction.SUBSCRIBE
      buttons.push([Markup.button.callback(buttonText, `${keyAction}|${id}`)])
    })
    return {
      text,
      buttons,
    }
  },
  menu: async () => {
    const memeSearchButton: TMenuButton = [
      i18n['ru'].button.search(),
      async ctx => {
        await enterToState(ctx, memeSearchState)
      },
    ]
    const backButton: TMenuButton = [
      i18n['ru'].button.back(),
      ctx => enterToState(ctx, channelSettingState),
    ]
    return {
      text: i18n['ru'].message.topicsMenu(),
      buttons: [[memeSearchButton, backButton]],
    }
  },
  onCallback: async (ctx: TTelegrafContext, callback: string) => {
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in topicSettingState`)
    }
    const [operation, topicNameIdString] = callback.split('|')
    const topicNameId = Number(topicNameIdString)
    const db = await getDbConnection()
    const [topic] = await selectBotTopicNameByIds(db, [topicNameId])
    const topics = await selectBotTopicByNames(db, [topic.name])
    if (!topics.length) {
      throw new InfoMessage(`Unknown menu state: ${callback}`)
    }

    await logUserAction(ctx, {
      operation,
      topicId: topic.id,
    })
    const keywordIds = topics.map(keyword => keyword.keywordId)
    const keywords = await selectBotKeywordByIds(db, keywordIds)

    if (operation === ETopicAction.SUBSCRIBE) {
      await insertBotTopicSubscription(db, [
        {
          topicId: topic.id,
          channelId: ctx.session.channel.id,
        },
      ])
      const keywordsForInsert = keywords?.map(keyword => ({ keyword: keyword.keyword }))
      await addSubscription(db, ctx.session.channel.id, keywordsForInsert)
    } else if (operation === ETopicAction.UNSUBSCRIBE) {
      await deleteBotTopicKeywordUnsubscription(db, ctx.session.channel.id, keywordIds)
      await deleteBotTopicSubscription(db, ctx.session.channel.id, topic.id)
      await deleteBotSubscription(db, ctx.session.channel.id, keywordIds)
    } else {
      throw new InfoMessage(`Unknown menu state: ${callback}`)
    }
    await db.close()

    const newText =
      operation === ETopicAction.UNSUBSCRIBE
        ? i18n['ru'].button.subscribeKeyword(topic.name)
        : i18n['ru'].button.unsubscribeKeyword(topic.name)
    const newOperation =
      operation === ETopicAction.UNSUBSCRIBE ? ETopicAction.SUBSCRIBE : ETopicAction.UNSUBSCRIBE
    await replaceInlineKeyboardButton(ctx, {
      [`${operation}|${topic.id}`]: Markup.button.callback(newText, `${newOperation}|${topic.id}`),
    })
    return
  },
}
