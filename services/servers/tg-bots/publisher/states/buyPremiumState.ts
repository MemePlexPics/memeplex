import { PREMIUM_12M, PREMIUM_1M, PREMIUM_3M } from '../../../../../constants/publisher'
import { EState } from '../constants'
import { i18n } from '../i18n'
import { TMenuButton, TState } from '../types'
import { enterToState, handleInvoiceCreation } from '../utils'
import { mainState } from './mainState'

export const buyPremiumState: TState = {
  stateName: EState.BUY_PREMIUM,
  menu: async () => {
    const backButton: TMenuButton = [
      i18n['ru'].button.back(),
      async ctx => {
        await enterToState(ctx, mainState)
      },
    ]
    return {
      text: i18n['ru'].message.freeTariff(),
      buttons: [
        [[i18n['ru'].button.butPremiumOneMonth(), ctx => handleInvoiceCreation(ctx, PREMIUM_1M)]],
        [[i18n['ru'].button.butPremiumThreeMonth(), ctx => handleInvoiceCreation(ctx, PREMIUM_3M)]],
        [
          [
            i18n['ru'].button.butPremiumTwelveMonth(),
            ctx => handleInvoiceCreation(ctx, PREMIUM_12M),
          ],
        ],
        [backButton],
      ],
    }
  },
}
