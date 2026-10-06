import { ETopicAction, EState } from '../constants'
import type { TMenuButton, TState, TTelegrafContext } from '../types'
import { enterToState, logUserAction, replaceInlineKeyboardButton } from '../utils'
import { channelSettingState, memeSearchState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  deleteBotTopicSubscription,
  insertBotTopicSubscription,
  selectBotTopicIdSubscriptionsByChannelId,
  selectBotTopicByNames,
  selectBotTopicNameByIds,
  selectBotTopicNames,
  deleteBotTopicKeywordUnsubscription,
} from '../../../../../utils/mysql-queries'
import { getTranslation, translateTopic } from '../i18n'
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
    const userTopicsRaw = await selectBotTopicIdSubscriptionsByChannelId(db, ctx.session.channel.id)
    const userTopics = userTopicsRaw.reduce((acc, { topicId }) => {
      acc.add(topicId)
      return acc
    }, new Set<number>())
    await db.close()
    const text = `
${getTranslation(ctx.from.language_code).message.topicDescription()}
${
  ctx.session.channel.id === ctx.from.id
    ? getTranslation(ctx.from.language_code).message.youEditingSubscriptionsForUser()
    : getTranslation(ctx.from.language_code).message.youEditingSubscriptionsForChannel(
        ctx.session.channel.name,
      )
}`

    const buttons: InlineKeyboardButton[][] = []
    topics.forEach(({ id, name }) => {
      if (!name) {
        return
      }
      const isSubscribed = userTopics.has(id)
      const buttonText = isSubscribed
        ? getTranslation(ctx.from.language_code).button.unsubscribeKeyword(
            translateTopic(name, ctx.from.language_code),
          )
        : getTranslation(ctx.from.language_code).button.subscribeKeyword(
            translateTopic(name, ctx.from.language_code),
          )
      const keyAction = isSubscribed ? ETopicAction.UNSUBSCRIBE : ETopicAction.SUBSCRIBE
      buttons.push([Markup.button.callback(buttonText, `${keyAction}|${id}`)])
    })
    return {
      text,
      buttons,
    }
  },
  menu: async ctx => {
    const memeSearchButton: TMenuButton = [
      getTranslation(ctx.from.language_code).button.search(),
      async ctx => {
        await enterToState(ctx, memeSearchState)
      },
    ]
    const backButton: TMenuButton = [
      getTranslation(ctx.from.language_code).button.back(),
      ctx => enterToState(ctx, channelSettingState),
    ]
    return {
      text: getTranslation(ctx.from.language_code).message.topicsMenu(),
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

    if (operation === ETopicAction.SUBSCRIBE) {
      await insertBotTopicSubscription(db, [
        {
          topicId: topic.id,
          channelId: ctx.session.channel.id,
        },
      ])
    } else if (operation === ETopicAction.UNSUBSCRIBE) {
      const keywordIds = topics.map(keyword => keyword.keywordId)
      await deleteBotTopicKeywordUnsubscription(db, ctx.session.channel.id, keywordIds)
      await deleteBotTopicSubscription(db, ctx.session.channel.id, topic.id)
    } else {
      throw new InfoMessage(`Unknown menu state: ${callback}`)
    }
    await db.close()

    const newText =
      operation === ETopicAction.UNSUBSCRIBE
        ? getTranslation(ctx.from.language_code).button.subscribeKeyword(
            translateTopic(topic.name, ctx.from.language_code),
          )
        : getTranslation(ctx.from.language_code).button.unsubscribeKeyword(
            translateTopic(topic.name, ctx.from.language_code),
          )
    const newOperation =
      operation === ETopicAction.UNSUBSCRIBE ? ETopicAction.SUBSCRIBE : ETopicAction.UNSUBSCRIBE
    await replaceInlineKeyboardButton(ctx, {
      [`${operation}|${topic.id}`]: Markup.button.callback(newText, `${newOperation}|${topic.id}`),
    })
    return
  },
}
