import { memeSearchState } from '.'
import { PREMIUM_PLANS } from '../../../../../constants/publisher'
import { getDbConnection, timestampToYyyyMmDd } from '../../../../../utils'
import { selectBotPremiumUser } from '../../../../../utils/mysql-queries'
import { EState } from '../constants'
import { i18n } from '../i18n'
import type { TMenuButton, TState } from '../types'
import { enterToState, handleInvoiceCreation } from '../utils'
import { mainState } from './mainState'

export const buyPremiumState: TState = {
  stateName: EState.BUY_PREMIUM,
  menu: async ctx => {
    const db = await getDbConnection()
    const [userPremium] = await selectBotPremiumUser(db, ctx.from.id)
    await db.close()
    if (userPremium) {
      ctx.session.premiumUntil = userPremium.untilTimestamp
    }
    const planButtons: TMenuButton[][] = PREMIUM_PLANS.map(plan => {
      const button: TMenuButton = [
        i18n['ru'].button.buyPremium(plan.emoji, plan.months, plan.cost),
        ctx => handleInvoiceCreation(ctx, plan.cost),
      ]
      return [button]
    })
    const memeSearchButton: TMenuButton = [
      i18n['ru'].button.search(),
      async ctx => {
        await enterToState(ctx, memeSearchState)
      },
    ]
    const backButton: TMenuButton = [
      i18n['ru'].button.back(),
      async ctx => {
        await enterToState(ctx, mainState)
      },
    ]
    const text = `${userPremium ? i18n['ru'].message.premiumUntilDate(timestampToYyyyMmDd(userPremium.untilTimestamp)) + '\n' : ''}
${i18n['ru'].message.premiumPlanFeatures()}`
    return {
      text,
      buttons: [...planButtons, [memeSearchButton, backButton]],
    }
  },
}
