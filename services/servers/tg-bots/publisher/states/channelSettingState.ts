import { EState } from '../constants'
import { TMenuButton, TState } from '../types'
import { enterToState, handlePaywall, onClickDeleteChannel } from '../utils'
import { keywordGroupSelectState, keywordSettingsState, mainState } from '.'
import { getDbConnection } from '../../../../../utils'
import { i18n } from '../i18n'
import { Markup } from 'telegraf'

export const channelSettingState: TState = {
  stateName: EState.CHANNEL_SETTINGS,
  menu: async ctx => {
    if (!ctx.from) {
      throw new Error('There is no ctx.from')
    }
    if (!ctx.session.channel) {
      throw new Error(`ctx.session.channel is undefined in channelSettingState`)
    }
    const db = await getDbConnection()
    await db.close()
    const editKeywordsButton: TMenuButton = [
      i18n['ru'].button.editKeywords(),
      ctx => enterToState(ctx, keywordSettingsState),
    ]
    const editKeywordGroupsButton: TMenuButton = [
      i18n['ru'].button.addKyewordGroup(ctx.hasPremiumSubscription ? '✏️' : '✨'),
      ctx => enterToState(ctx, keywordGroupSelectState),
    ]
    const buyPremiumButton: TMenuButton = [
      ctx.hasPremiumSubscription
        ? i18n['ru'].button.extendPremium()
        : i18n['ru'].button.subscribeToPremium(),
      ctx => handlePaywall(ctx),
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
              [Markup.button.callback(i18n['ru'].button.back(), 'back')],
            ],
          },
        })
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
    if (ctx.hasPremiumSubscription) {
      buttons.push([editKeywordsButton])
      buttons.push([editKeywordGroupsButton])
    } else {
      buttons.push([editKeywordGroupsButton])
      buttons.push([editKeywordsButton])
    }
    if (ctx.session.channel.id === ctx.from?.id) {
      buttons.push([unlinkChannelButton])
    }
    buttons.push([buyPremiumButton])
    buttons.push([backButton])
    return {
      text: `
${i18n['ru'].message.thereTopicsAndKeywords()}
${ctx.hasPremiumSubscription ? '' : i18n['ru'].message.topicAndKeywordsAccessByPlan()}

${
  ctx.session.channel?.id === ctx.from.id
    ? i18n['ru'].message.youEditingSubscriptionsForUser()
    : i18n['ru'].message.youEditingSubscriptionsForChannel(ctx.session.channel?.name)
}`,
      buttons,
    }
  },
  onCallback: async (ctx, callback) => {
    if (callback === 'unlink') {
      await onClickDeleteChannel(ctx)
      ctx.session.channel = undefined
      await enterToState(ctx, mainState)
    } else if (callback === 'back') {
      await enterToState(ctx, channelSettingState)
    }
  },
}
