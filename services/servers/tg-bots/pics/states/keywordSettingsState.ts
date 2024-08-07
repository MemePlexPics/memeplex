import { EKeywordAction, EKeywordSettingKeywordType, EState, callbackData } from '../constants'
import type { TMenuButton, TSplitCallback, TState } from '../types'
import {
  addSubscription,
  enterToState,
  handleKeywordAction,
  handleTopicKeywordAction,
  logUserAction,
} from '../utils'
import { channelSettingState } from '.'
import { InfoMessage, getDbConnection, sqlWithPagination } from '../../../../../utils'
import {
  countBotSubscriptionsByChannelId,
  countBotTopicKeywordsSubscriptionsByChannelId,
  selectBotSubscriptionsByChannelId,
  selectBotTopicSubscriptionKeywordsByChannelId,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { isCommonMessage } from '../typeguards'
import { Markup } from 'telegraf'
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const keywordSettingsState: TState = {
  stateName: EState.KEYWORD_SETTINGS,
  menu: async _ctx => {
    const sendKeywordsButton: TMenuButton = [
      i18n['ru'].button.sendKeywords(),
      async ctx => {
        if (!ctx.session.channel) {
          throw new Error(`ctx.session.channel is undefined in keywordSettingsState`)
        }
        const db = await getDbConnection()
        const keywordRows = await selectBotSubscriptionsByChannelId(db, ctx.session.channel.id)
        await db.close()
        if (keywordRows.length === 0) {
          await ctx.reply(i18n['ru'].message.thereAreNoKeywords())
          return
        }
        const keywords = keywordRows.reduce((acc, keywordRow) => {
          if (acc) {
            if (!keywordRow.keyword) return acc
            return `${acc}, ${keywordRow.keyword}`
          }
          return keywordRow.keyword ?? acc
        }, '')
        await ctx.reply(keywords)
      },
    ]
    const backButton: TMenuButton = [
      i18n['ru'].button.back(),
      async ctx => {
        ctx.session.pagination = undefined
        await enterToState(ctx, channelSettingState)
      },
    ]
    return {
      text: i18n['ru'].message.keywordSettings(),
      buttons: [[sendKeywordsButton], [backButton]],
    }
  },
  inlineMenu: async ctx => {
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in keywordSettingsState`)
    }
    if (!ctx.session.pagination) {
      ctx.session.pagination = {
        page: 1,
      }
    }
    const page = ctx.session.pagination.page
    const db = await getDbConnection()
    const totalSubscriptions = await countBotSubscriptionsByChannelId(db, ctx.session.channel.id)
    const totalTopicSubscriptionKeywords = await countBotTopicKeywordsSubscriptionsByChannelId(
      db,
      ctx.session.channel.id,
    )
    const pageSize = 20
    const doesNextPageExist =
      Math.ceil(
        (totalSubscriptions + totalTopicSubscriptionKeywords - (page - 1) * pageSize) / pageSize,
      ) > 1
    const paginationButtons: InlineKeyboardButton[] = []
    if (page > 1)
      paginationButtons.push({
        text: i18n['ru'].button.back(),
        callback_data: `page|back`,
      })
    if (doesNextPageExist)
      paginationButtons.push({
        text: i18n['ru'].button.forward(),
        callback_data: `page|next`,
      })
    const keywordRows = await sqlWithPagination(
      selectBotSubscriptionsByChannelId(db, ctx.session.channel.id).$dynamic(),
      page,
      pageSize,
    )
    const totalRows: Awaited<
    ReturnType<
    | typeof selectBotSubscriptionsByChannelId
    | typeof selectBotTopicSubscriptionKeywordsByChannelId
    >
    >[number][] = keywordRows
    if (keywordRows.length < pageSize) {
      const topicKeywordRows = await selectBotTopicSubscriptionKeywordsByChannelId(
        db,
        ctx.session.channel.id,
      )
        .limit(pageSize - keywordRows.length)
        .offset(Math.max(pageSize * (page - 1) - totalSubscriptions, 0))
      topicKeywordRows.forEach(row => totalRows.push(row))
    }
    await db.close()
    if (totalRows.length === 0) {
      return false
    }
    const text = `${
      ctx.session.channel?.id === ctx.from.id
        ? i18n['ru'].message.unsubscribeFromKeywords()
        : i18n['ru'].message.youEditingSubscriptionsForChannel(ctx.session.channel?.name)
    }`
    return {
      text,
      buttons: totalRows
        .map(keywordRow => {
          const callback_data =
            'topic' in keywordRow && keywordRow.topic && keywordRow.topicId
              ? callbackData.keywordSetting.topicKeyword(
                keywordRow.unsubscribed ? EKeywordAction.SUBSCRIBE : EKeywordAction.DELETE,
                keywordRow.keywordId as number,
                keywordRow.topicId,
              )
              : callbackData.keywordSetting.keyword(
                EKeywordAction.DELETE,
                keywordRow.keywordId as number,
              )
          const text =
            'topic' in keywordRow && keywordRow.topic
              ? i18n['ru'].button.keywordSettings.topicKeyword[
                keywordRow.unsubscribed ? 'subscribe' : 'unsubscribe'
              ](keywordRow.keyword as string, keywordRow.topic)
              : i18n['ru'].button.keywordSettings.keyword.unsubscribe(keywordRow.keyword as string)
          return [
            {
              text,
              callback_data: callback_data,
            } as InlineKeyboardButton,
          ]
        })
        .concat([paginationButtons]),
    }
  },
  onCallback: async (ctx, callback) => {
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in keywordSettingsState`)
    }
    const [firstPartCb, ...restCb] = callback.split('|')
    if (firstPartCb === EKeywordSettingKeywordType.KEYWORD) {
      const restCbData = restCb as TSplitCallback<
      ReturnType<typeof callbackData.premoderation.keywordButton>
      >
      const [action, keywordId] = restCbData
      await handleKeywordAction(
        ctx,
        action as EKeywordAction,
        ctx.session.channel.id,
        Number(keywordId),
        false,
      )
    } else if (firstPartCb === EKeywordSettingKeywordType.TOPIC_KEYWORD) {
      const restCbData = restCb as TSplitCallback<
      ReturnType<typeof callbackData.premoderation.topicKeywordsButton>
      >
      const [action, keywordId, topicId] = restCbData
      await handleTopicKeywordAction(
        ctx,
        action as EKeywordAction,
        ctx.session.channel.id,
        Number(keywordId),
        Number(topicId),
        false,
      )
    } else if (firstPartCb === 'page') {
      if (!ctx.session.pagination) {
        throw new Error(`ctx.session.pagination is undefined in keywordSettingsState`)
      }
      const command = restCb[0]
      if (command === 'next') {
        ctx.session.pagination.page++
      } else {
        ctx.session.pagination.page--
      }
    } else {
      throw new InfoMessage(`Unknown menu state: ${callback}`)
    }
    if (
      ctx.callbackQuery &&
      keywordSettingsState.inlineMenu &&
      isCommonMessage(ctx.callbackQuery.message)
    ) {
      const inlineMenu = await keywordSettingsState.inlineMenu(ctx)
      if (inlineMenu) {
        await ctx.editMessageReplyMarkup(Markup.inlineKeyboard(inlineMenu.buttons).reply_markup)
      }
    }
    return
  },
  onText: async (ctx, keywordsRaw) => {
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in keywordSettingsState`)
    }
    const keywords = keywordsRaw
      .split('\n')
      .map(line => line.split(','))
      .flat()
    const keywordValues = keywords.map(keyword => {
      const keywordTrimmed = keyword.replace('|', '').toLowerCase().trim().slice(0, 255)
      return {
        keyword: keywordTrimmed,
      }
    })
    const keywordValuesNotEmpty = keywordValues.filter(keywordObj => keywordObj.keyword.length)
    if (keywordValuesNotEmpty.length === 0) {
      await ctx.reply(i18n['ru'].message.delimetersInsteadOfKeywords())
      return
    }

    const db = await getDbConnection()
    await addSubscription(db, ctx.session.channel.id, keywordValuesNotEmpty)
    await db.close()

    await ctx.reply(i18n['ru'].message.addedKeywords())
    await logUserAction(ctx, {
      info: `Added`,
      keywords: keywordValuesNotEmpty.map(keywordRow => keywordRow.keyword).join(', '),
    })
    await enterToState(ctx, keywordSettingsState)
    return
  },
}
