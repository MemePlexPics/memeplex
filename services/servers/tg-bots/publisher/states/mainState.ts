import { EState } from '../constants'
import { TMenuButton, TState } from '../types'
import { enterToState, onClickAddMyself } from '../utils'
import { addChannelState, addKeywordsState, channelSelectState, keywordGroupSelectState } from '.'
import { getDbConnection } from '../../../../../utils'
import { countPublisherChannelsByUserId } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { getPublisherUserTariffPlan } from '../../../../utils'

export const mainState: TState = {
  stateName: EState.MAIN,
  menu: async ctx => {
    const db = await getDbConnection()
    const userChannelsCount = await countPublisherChannelsByUserId(db, ctx.from.id)
    await db.close()
    const buttons: TMenuButton[][] = [
      [[i18n['ru'].button.linkYourChannel(), () => enterToState(ctx, addChannelState)]],
      [
        [
          i18n['ru'].button.addKeywords(),
          async () => {
            await onClickAddMyself(ctx)
            const db = await getDbConnection()
            const userTariff = await getPublisherUserTariffPlan(db, ctx.from.id)
            const nextState = userTariff === 'premium' ? addKeywordsState : keywordGroupSelectState
            await enterToState(ctx, nextState)
          },
        ],
      ],
    ]
    if (userChannelsCount !== 0) {
      buttons.push([
        [i18n['ru'].button.subscriptionSettings(), () => enterToState(ctx, channelSelectState)],
      ])
    }
    return {
      text: i18n['ru'].message.subscriptionsMenu(),
      buttons,
    }
  },
}
