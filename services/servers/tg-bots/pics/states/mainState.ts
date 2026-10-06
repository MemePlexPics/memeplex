import { EState } from '../constants'
import type { TMenuButton, TState } from '../types'
import { enterToState, onClickAddMyself } from '../utils'
import { addChannelState, buyPremiumState, channelSettingState, memeSearchState } from '.'
import { getDbConnection } from '../../../../../utils'
import { getTranslation } from '../i18n'
import { selectBotChannelsByUserId } from '../../../../../utils/mysql-queries'
import { Markup } from 'telegraf'
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const mainState: TState = {
  stateName: EState.MAIN,
  inlineMenu: async ctx => {
    const db = await getDbConnection()
    const userChannels = await selectBotChannelsByUserId(db, ctx.from.id)
    await db.close()

    const channelButtons: InlineKeyboardButton[][] = userChannels
      .filter(userChannel => userChannel.type === 'channel')
      .map(({ id, username }) => [
        Markup.button.callback(
          getTranslation(ctx.from.language_code).button.channelSubscriptions(username),
          `${id}|${username}`,
        ),
      ])
    return {
      text: getTranslation(ctx.from.language_code).message.subscriptionSettings(),
      buttons: [...channelButtons],
    }
  },
  menu: async ctx => {
    const linkYourChannelButton: TMenuButton = [
      getTranslation(ctx.from.language_code).button.linkYourChannel(),
      ctx => enterToState(ctx, addChannelState),
    ]
    const buyPremium: TMenuButton = [
      (await ctx.hasPremiumSubscription)
        ? getTranslation(ctx.from.language_code).button.extendPremium()
        : getTranslation(ctx.from.language_code).button.subscribeToPremium(),
      ctx => enterToState(ctx, buyPremiumState),
    ]
    const mySubscriptionsButton: TMenuButton = [
      getTranslation(ctx.from.language_code).button.mySubscriptions(),
      async () => {
        await onClickAddMyself(ctx)
        await enterToState(ctx, channelSettingState)
      },
    ]
    const memeSearchButton: TMenuButton = [
      getTranslation(ctx.from.language_code).button.searchMemes(),
      async ctx => {
        await enterToState(ctx, memeSearchState)
      },
    ]
    return {
      text: getTranslation(ctx.from.language_code).message.mainMenu(),
      buttons: [[mySubscriptionsButton], [linkYourChannelButton], [memeSearchButton, buyPremium]],
    }
  },
  onCallback: async (ctx, callback) => {
    const [id, name] = callback.split('|')
    ctx.session.channel = {
      id: Number(id),
      name,
      type: 'channel',
    }
    await enterToState(ctx, channelSettingState)
  },
}
