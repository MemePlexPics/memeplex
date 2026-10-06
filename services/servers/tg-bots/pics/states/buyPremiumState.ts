import { memeSearchState } from '.'
import { getDbConnection, timestampToYyyyMmDd } from '../../../../../utils'
import { selectBotPremiumUser } from '../../../../../utils/mysql-queries'
import { EState } from '../constants'
import { getTranslation } from '../i18n'
import type { TMenuButton, TState } from '../types'
import { enterToState, handleAskForPremium } from '../utils'
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
    const askForPremiumButton: TMenuButton = [
      getTranslation(ctx.from.language_code).button.askForPremium(),
      ctx => handleAskForPremium(ctx),
    ]
    const memeSearchButton: TMenuButton = [
      getTranslation(ctx.from.language_code).button.search(),
      async ctx => {
        await enterToState(ctx, memeSearchState)
      },
    ]
    const backButton: TMenuButton = [
      getTranslation(ctx.from.language_code).button.back(),
      async ctx => {
        await enterToState(ctx, mainState)
      },
    ]
    const text = `${userPremium ? getTranslation(ctx.from.language_code).message.premiumUntilDate(timestampToYyyyMmDd(userPremium.untilTimestamp)) + '\n' : ''}
${getTranslation(ctx.from.language_code).message.premiumPlanFeatures()}`
    return {
      text,
      buttons: [[askForPremiumButton], [memeSearchButton, backButton]],
    }
  },
}
