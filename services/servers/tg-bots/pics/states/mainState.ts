import { EState } from '../constants'
import type { TMenuButton, TState } from '../types'
import { enterToState, onClickAddMyself } from '../utils'
import { addChannelState, buyPremiumState, channelSettingState, memeSearchState } from '.'
import { getDbConnection } from '../../../../../utils'
import { i18n } from '../i18n'
import { selectBotChannelsByUserId } from '../../../../../utils/mysql-queries'
import { Markup } from 'telegraf'
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { botChannels } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'

export const mainState: TState = {
  stateName: EState.MAIN,
  inlineMenu: async ctx => {
    const db = await getDbConnection()
    const userChannels = await selectBotChannelsByUserId(db, ctx.from.id)
    await db.close()

    const channelButtons: InlineKeyboardButton[][] = userChannels
      .filter(userChannel => userChannel.type === 'channel')
      .map(({ id, username }) => [
        Markup.button.callback(i18n['ru'].button.channelSubscriptions(username), `${id}`),
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
    const memeSearchButton: TMenuButton = [
      i18n['ru'].button.searchMemes(),
      async ctx => {
        await enterToState(ctx, memeSearchState)
      },
    ]
    return {
      text: i18n['ru'].message.mainMenu(),
      buttons: [[mySubscriptionsButton], [linkYourChannelButton], [memeSearchButton, buyPremium]],
    }
  },
  onCallback: async (ctx, callback) => {
    const id = callback
    const db = await getDbConnection()
    const [channel] = await db
      .select()
      .from(botChannels)
      .where(eq(botChannels.id, Number(id)))
    await db.close()
    ctx.session.channel = {
      id: channel.id,
      telegramId: channel.telegramId,
      name: channel.username,
      type: channel.type,
    }
    await enterToState(ctx, channelSettingState)
  },
}
