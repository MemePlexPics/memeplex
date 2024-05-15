import { EKeywordGroupAction, EState } from '../constants'
import { TState, TTelegrafContext } from '../types'
import {
  addSubscription,
  deleteSubscription,
  enterToState,
  logUserAction,
  replaceInlineKeyboardButton,
} from '../utils'
import { channelSettingState } from '.'
import { InfoMessage, getDbConnection } from '../../../../../utils'
import {
  deletePublisherGroupSubscription,
  insertPublisherGroupSubscription,
  selectPublisherGroupSubscriptionsByUserId,
  selectPublisherKeywordGroupByName,
  selectPublisherKeywordGroups,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { isCallbackButton, isCommonMessage } from '../typeguards'
import { Markup } from 'telegraf'

export const keywordGroupSelectState: TState = {
  stateName: EState.KEYWORD_GROUP_SELECT,
  inlineMenu: async ctx => {
    if (!ctx.from) {
      throw new Error('There is no ctx.from')
    }
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in addKeywordsState`)
    }
    const db = await getDbConnection()
    const keywordGroups = await selectPublisherKeywordGroups(db)
    const userKeywordGroupsRaw = await selectPublisherGroupSubscriptionsByUserId(db, ctx.from.id)
    const userKeywordGroups = userKeywordGroupsRaw.reduce((acc, { groupName }) => {
      acc.add(groupName)
      return acc
    }, new Set<string>())
    await db.close()
    const text = `
${i18n['ru'].message.keywordGroupDescription()}
${
  ctx.session.channel.id === ctx.from.id
    ? i18n['ru'].message.youEditingSubscriptionsForUser()
    : i18n['ru'].message.youEditingSubscriptionsForChannel(ctx.session.channel.name)
}`

    const buttons = keywordGroups.map(({ name }) => {
      const isSubscribed = userKeywordGroups.has(name)
      const buttonText = isSubscribed
        ? i18n['ru'].button.unsubscribeKeyword(name)
        : i18n['ru'].button.subscribeKeyword(name)
      const keyAction = isSubscribed
        ? EKeywordGroupAction.UNSUBSCRIBE
        : EKeywordGroupAction.SUBSCRIBE
      return [Markup.button.callback(buttonText, `${keyAction}|${name}`)]
    })
    return {
      text,
      buttons,
    }
  },
  menu: async () => {
    return {
      text: i18n['ru'].message.keywordGroupsMenu(),
      buttons: [[[i18n['ru'].button.back(), ctx => enterToState(ctx, channelSettingState)]]],
    }
  },
  onCallback: async (ctx: TTelegrafContext, callback: string) => {
    if (!ctx.from) {
      throw new Error('There is no ctx.from')
    }
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in keywordGroupSelectState`)
    }
    const [operation, groupName] = callback.split('|')
    const db = await getDbConnection()
    const keywordGroup = await selectPublisherKeywordGroupByName(db, groupName)
    if (!keywordGroup.length || !keywordGroup[0].keywords)
      throw new InfoMessage(`Unknown menu state: ${callback}`)

    logUserAction(ctx, {
      operation,
      group: groupName,
    })
    // if (operation === EKeywordGroupAction.INFO) {
    //   const [keywordGroup] = await selectPublisherKeywordGroupByName(db, groupName)
    //   await ctx.reply(
    //     i18n['ru'].message.topicContainKewords(keywordGroup.name, keywordGroup.keywords),
    //   )
    //   return
    // }

    const keywords = keywordGroup[0].keywords.split(', ')

    if (operation === EKeywordGroupAction.SUBSCRIBE) {
      await insertPublisherGroupSubscription(db, [
        {
          groupName,
          channelId: ctx.session.channel.id,
        },
      ])
      const keywordsForInsert = keywords?.map(keyword => ({ keyword }))
      await addSubscription(db, ctx.session.channel.id, keywordsForInsert)
    } else if (operation === EKeywordGroupAction.UNSUBSCRIBE) {
      await deletePublisherGroupSubscription(db, ctx.session.channel.id, groupName)
      await deleteSubscription(db, ctx.session.channel.id, keywords)
    } else {
      throw new InfoMessage(`Unknown menu state: ${callback}`)
    }
    await db.close()

    const newText =
      operation === EKeywordGroupAction.UNSUBSCRIBE
        ? i18n['ru'].button.subscribeKeyword(groupName)
        : i18n['ru'].button.unsubscribeKeyword(groupName)
    const newOperation =
      operation === EKeywordGroupAction.UNSUBSCRIBE
        ? EKeywordGroupAction.SUBSCRIBE
        : EKeywordGroupAction.UNSUBSCRIBE
    await replaceInlineKeyboardButton(ctx, {
      [`${operation}|${groupName}`]: Markup.button.callback(
        newText,
        `${newOperation}|${groupName}`,
      ),
    })
    return
  },
}
