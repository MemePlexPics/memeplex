import { memeSearchState } from '.'
import { PREMIUM_PLANS } from '../../../../../constants/publisher'
import { EState } from '../constants'
import { i18n } from '../i18n'
import type { TMenuButton, TState } from '../types'
import { enterToState, handleInvoiceCreation } from '../utils'
import { mainState } from './mainState'

export const buyPremiumState: TState = {
  stateName: EState.BUY_PREMIUM,
  menu: async () => {
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
    return {
      text: i18n['ru'].message.premiumPlanFeatures(),
      buttons: [...planButtons, [memeSearchButton, backButton]],
    }
  },
}
