import { EKeywordAction, EState } from '../constants'
import { TMenuButton, TState, TTelegrafContext } from '../types'
import { addSubscription, enterToState, logUserAction } from '../utils'
import { channelSettingState } from '.'
import { InfoMessage, getDbConnection, sqlWithPagination } from '../../../../../utils'
import {
  countPublisherSubscriptionsByChannelId,
  deletePublisherKeyword,
  deletePublisherSubscriptionsByKeywordId,
  selectPublisherSubscriptionsByChannelId,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { isCommonMessage } from '../typeguards'
import { Markup } from 'telegraf'

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
        const keywordRows = await selectPublisherSubscriptionsByChannelId(
          db,
          ctx.session.channel.id,
        )
        await db.close()
        if (keywordRows.length === 0) {
          await ctx.reply(i18n['ru'].message.thereAreNoKeywords())
          return
        }
        await ctx.reply(
          keywordRows.reduce((acc, keywordRow) => {
            if (acc) {
              if (!keywordRow.keyword) return acc
              return `${acc}, ${keywordRow.keyword}`
            }
            return keywordRow.keyword ?? acc
          }, ''),
        )
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
    if (!ctx.from) {
      throw new Error('There is no ctx.from')
    }
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
    const totalSubscriptions = await countPublisherSubscriptionsByChannelId(
      db,
      ctx.session.channel.id,
    )
    const paginationButtons = []
    const pageSize = 20
    if (page > 1)
      paginationButtons.push({
        text: i18n['ru'].button.back(),
        callback_data: `page|back`,
      })
    if ((totalSubscriptions - (page - 1) * pageSize) / pageSize > 1)
      paginationButtons.push({
        text: i18n['ru'].button.forward(),
        callback_data: `page|next`,
      })
    const keywordRows = await sqlWithPagination(
      selectPublisherSubscriptionsByChannelId(db, ctx.session.channel.id).$dynamic(),
      page,
      pageSize,
    )
    await db.close()
    if (keywordRows.length === 0) {
      return false
    }
    return {
      text: `${
        ctx.session.channel?.id === ctx.from.id
          ? i18n['ru'].message.unsubscribeFromKeywords()
          : i18n['ru'].message.youEditingSubscriptionsForChannel(ctx.session.channel?.name)
      }`,
      buttons: keywordRows
        .map(keywordRow => [
          {
            text: `🔕 ${keywordRow.keyword}`,
            callback_data: `${EKeywordAction.DELETE}|${keywordRow.id}`,
          },
        ])
        .concat([paginationButtons]),
    }
  },
  onCallback: async (ctx: TTelegrafContext, callback: string) => {
    const [command, argument] = callback.split('|')
    if (command === 'del' && argument) {
      if (!ctx.from) {
        throw new Error('There is no ctx.from')
      }
      const db = await getDbConnection()
      await deletePublisherSubscriptionsByKeywordId(db, Number(argument))
      await deletePublisherKeyword(db, argument)
      await db.close()
      logUserAction(ctx, {
        error: `Deleted`,
        keyword: argument,
      })
    } else if (command === 'page') {
      if (!ctx.session.pagination) {
        throw new Error(`ctx.session.pagination is undefined in keywordSettingsState`)
      }
      if (argument === 'next') {
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
    if (!ctx.from) {
      throw new Error('There is no ctx.from')
    }
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
    logUserAction(ctx, {
      info: `Added`,
      keywords: keywordValuesNotEmpty.map(keywordRow => keywordRow.keyword).join(', '),
    })
    await enterToState(ctx, channelSettingState)
    return
  },
}
