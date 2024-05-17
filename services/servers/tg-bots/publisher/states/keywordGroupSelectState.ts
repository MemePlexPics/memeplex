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
  selectPublisherGroupIdSubscriptionsByUserId,
  selectPublisherKeywordByIds,
  selectPublisherKeywordGroupByIds,
  selectPublisherKeywordGroupNameByIds,
  selectPublisherKeywordGroups,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { Markup } from 'telegraf'
import { InlineKeyboardButton } from '@telegraf/types'

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
    const userKeywordGroupsRaw = await selectPublisherGroupIdSubscriptionsByUserId(db, ctx.from.id)
    const userKeywordGroups = userKeywordGroupsRaw.reduce((acc, { groupId }) => {
      acc.add(groupId)
      return acc
    }, new Set<number>())
    await db.close()
    const text = `
${i18n['ru'].message.keywordGroupDescription()}
${
  ctx.session.channel.id === ctx.from.id
    ? i18n['ru'].message.youEditingSubscriptionsForUser()
    : i18n['ru'].message.youEditingSubscriptionsForChannel(ctx.session.channel.name)
}`

    const buttons: InlineKeyboardButton[][] = []
    keywordGroups.forEach(({ id, name }) => {
      if (!name) {
        return
      }
      const isSubscribed = userKeywordGroups.has(id)
      const buttonText = isSubscribed
        ? i18n['ru'].button.unsubscribeKeyword(name)
        : i18n['ru'].button.subscribeKeyword(name)
      const keyAction = isSubscribed
        ? EKeywordGroupAction.UNSUBSCRIBE
        : EKeywordGroupAction.SUBSCRIBE
      buttons.push([Markup.button.callback(buttonText, `${keyAction}|${id}`)])
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
    const [operation, groupIdString] = callback.split('|')
    const groupId = Number(groupIdString)
    const db = await getDbConnection()
    const keywordGroups = await selectPublisherKeywordGroupByIds(db, [groupId])
    if (!keywordGroups.length) {
      throw new InfoMessage(`Unknown menu state: ${callback}`)
    }
    const [group] = await selectPublisherKeywordGroupNameByIds(db, [groupId])

    logUserAction(ctx, {
      operation,
      groupId,
    })
    // if (operation === EKeywordGroupAction.INFO) {
    //   const [keywordGroup] = await selectPublisherKeywordGroupByNames(db, [groupName])
    //   await ctx.reply(
    //     i18n['ru'].message.topicContainKewords(keywordGroup.name, keywordGroup.keywords),
    //   )
    //   return
    // }
    const keywordIds = keywordGroups.map(keyword => keyword.keywordId)
    const keywords = await selectPublisherKeywordByIds(db, keywordIds)

    if (operation === EKeywordGroupAction.SUBSCRIBE) {
      await insertPublisherGroupSubscription(db, [
        {
          groupId: groupId,
          channelId: ctx.session.channel.id,
        },
      ])
      const keywordsForInsert = keywords?.map(keyword => ({ keyword: keyword.keyword }))
      await addSubscription(db, ctx.session.channel.id, keywordsForInsert)
    } else if (operation === EKeywordGroupAction.UNSUBSCRIBE) {
      await deletePublisherGroupSubscription(db, ctx.session.channel.id, groupId)
      await deleteSubscription(db, ctx.session.channel.id, keywordIds)
    } else {
      throw new InfoMessage(`Unknown menu state: ${callback}`)
    }
    await db.close()

    const newText =
      operation === EKeywordGroupAction.UNSUBSCRIBE
        ? i18n['ru'].button.subscribeKeyword(group.name)
        : i18n['ru'].button.unsubscribeKeyword(group.name)
    const newOperation =
      operation === EKeywordGroupAction.UNSUBSCRIBE
        ? EKeywordGroupAction.SUBSCRIBE
        : EKeywordGroupAction.UNSUBSCRIBE
    await replaceInlineKeyboardButton(ctx, {
      [`${operation}|${groupId}`]: Markup.button.callback(newText, `${newOperation}|${groupId}`),
    })
    return
  },
}
