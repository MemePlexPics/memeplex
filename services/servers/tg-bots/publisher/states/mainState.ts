import { EState } from '../constants'
import type { TMenuButton, TState } from '../types'
import { enterToState, onClickAddMyself } from '../utils'
import { addChannelState, buyPremiumState, channelSettingState } from '.'
import { getDbConnection } from '../../../../../utils'
import { i18n } from '../i18n'
import { selectPublisherChannelsByUserId } from '../../../../../utils/mysql-queries'
import { Markup } from 'telegraf'
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const mainState: TState = {
  stateName: EState.MAIN,
  inlineMenu: async ctx => {
    if (!ctx.from) {
      throw new Error('There is no ctx.from')
    }
    const db = await getDbConnection()
    const userChannels = await selectPublisherChannelsByUserId(db, ctx.from.id)
    await db.close()

    const channelButtons: InlineKeyboardButton[][] = userChannels
      .filter(userChannel => userChannel.type === 'channel')
      .map(({ id, username }) => [
        Markup.button.callback(
          i18n['ru'].button.channelSubscriptions(username),
          `${id}|${username}`,
        ),
      ])
    return {
      text: i18n['ru'].message.subscriptionSettings(),
      buttons: [...channelButtons],
    }
  },
  menu: async ctx => {
    const linkYourChannelButton: TMenuButton = [
      i18n['ru'].button.linkYourChannel(),
      ctx => enterToState(ctx, addChannelState),
    ]
    const buyPremium: TMenuButton = [
      (await ctx.hasPremiumSubscription)
        ? i18n['ru'].button.extendPremium()
        : i18n['ru'].button.subscribeToPremium(),
      ctx => enterToState(ctx, buyPremiumState),
    ]
    const mySubscriptionsButton: TMenuButton = [
      i18n['ru'].button.mySubscriptions(),
      async () => {
        await onClickAddMyself(ctx)
        await enterToState(ctx, channelSettingState)
      },
    ]
    return {
      text: i18n['ru'].message.mainMenu(),
      buttons: [[mySubscriptionsButton], [linkYourChannelButton], [buyPremium]],
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
