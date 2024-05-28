import { EState } from '../constants'
import type { TMenuButton, TState } from '../types'
import { enterToState, onClickDeleteChannel } from '../utils'
import {
  buyPremiumState,
  topicSelectState,
  keywordSettingsState,
  mainState,
  memeSearchState,
} from '.'
import { getDbConnection } from '../../../../../utils'
import { i18n } from '../i18n'
import { Markup } from 'telegraf'

export const channelSettingState: TState = {
  stateName: EState.CHANNEL_SETTINGS,
  menu: async ctx => {
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in channelSettingState`)
    }
    const hasPremiumSubscription = await ctx.hasPremiumSubscription
    const isChannel = ctx.session.channel.id !== ctx.from.id
    const db = await getDbConnection()
    await db.close()
    const editKeywordsButton: TMenuButton = [
      i18n['ru'].button.editKeywords(isChannel ? ctx.session.channel.name : undefined),
      ctx => enterToState(ctx, keywordSettingsState),
    ]
    const editTopicsButton: TMenuButton = [
      i18n['ru'].button.editTopics(
        hasPremiumSubscription ? '✏️' : '✨',
        isChannel ? ctx.session.channel.name : undefined,
      ),
      ctx => enterToState(ctx, topicSelectState),
    ]
    const buyPremiumButton: TMenuButton = [
      i18n['ru'].button.premium(),
      ctx => enterToState(ctx, buyPremiumState),
    ]
    const unlinkChannelButton: TMenuButton = [
      i18n['ru'].button.unlinkChannel(ctx.session.channel.name),
      async ctx => {
        if (!ctx.session.channel) {
          throw new Error(`ctx.session.channel is undefined in channelSettingState`)
        }
        await ctx.reply(i18n['ru'].message.doYouWantToUnlinkChannel(ctx.session.channel.name), {
          reply_markup: {
            inline_keyboard: [
              [Markup.button.callback(i18n['ru'].button.unlinkChannelConfirm(), 'unlink')],
            ],
          },
        })
      },
    ]
    const memeSearchButton: TMenuButton = [
      i18n['ru'].button.search(),
      async ctx => {
        await enterToState(ctx, memeSearchState)
      },
    ]
    const backButton: TMenuButton = [
      i18n['ru'].button.back(),
      async ctx => {
        ctx.session.channel = undefined
        await enterToState(ctx, mainState)
      },
    ]
    const buttons: TMenuButton[][] = []
    if (hasPremiumSubscription) {
      buttons.push([editKeywordsButton])
      buttons.push([editTopicsButton])
    } else {
      buttons.push([editTopicsButton])
      buttons.push([editKeywordsButton])
    }
    if (ctx.session.channel.id !== ctx.from?.id) {
      buttons.push([buyPremiumButton, unlinkChannelButton])
    } else {
      buttons.push([buyPremiumButton])
    }
    buttons.push([memeSearchButton, backButton])
    return {
      text: i18n['ru'].message.thereTopicsAndKeywords(),
      buttons,
    }
  },
  onCallback: async (ctx, callback) => {
    if (callback === 'unlink') {
      await onClickDeleteChannel(ctx)
      // await ctx.deleteMessage()
      ctx.session.channel = undefined
      await ctx.reply(i18n['ru'].message.youCanDemoteBotFromAdmin())
      await enterToState(ctx, mainState)
    }
  },
}
