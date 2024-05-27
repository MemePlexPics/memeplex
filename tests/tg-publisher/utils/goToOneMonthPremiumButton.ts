import { KeyboardButton } from 'telegraf/typings/core/types/typegram'
import { TelegramClientWrapper } from '.'
import { i18n } from '../../../services/servers/tg-bots/publisher/i18n'
import { PREMIUM_PLANS } from '../../../constants/publisher'

export const goToOneMonthPremiumButton = async (tgClient: TelegramClientWrapper) => {
  // TODO: DRY...
  const oneMonthPremium = PREMIUM_PLANS.find(plan => plan.months === 1)
  if (!oneMonthPremium) {
    throw new Error(
      `There is no premium plan for one month: ${JSON.stringify(PREMIUM_PLANS, null, 2)}`,
    )
  }
  const oneMonthPremiumButtonText = i18n['ru'].button.buyPremium(
    oneMonthPremium.emoji,
    oneMonthPremium.months,
    oneMonthPremium.cost,
  )

  const startUpdates = await tgClient.executeCommand('/start')
  if (!startUpdates) {
    throw new Error(`There is no updates after /start`)
  }
  const menuMessage = startUpdates.result.find(
    update => update.message.text === i18n['ru'].message.mainMenu(),
  )
  if (!menuMessage) {
    throw new Error(`There is no menu message: ${JSON.stringify(startUpdates, null, 2)}`)
  }
  const premiumButton = menuMessage.message.reply_markup.keyboard.find((row: KeyboardButton[]) =>
    row.find(button => button === i18n['ru'].button.subscribeToPremium()),
  )
  if (!premiumButton) {
    throw new Error(
      `There is no «${i18n['ru'].button.subscribeToPremium()}» button for a new user: ${JSON.stringify(menuMessage, undefined, 2)}`,
    )
  }
  const premiumUpdates = await tgClient.executeMessage(i18n['ru'].button.subscribeToPremium())
  if (!premiumUpdates) {
    throw new Error(`There is no updates after pressed «${i18n['ru'].button.subscribeToPremium()}»`)
  }
  const premiumMenuMessage = premiumUpdates.result.find(
    update => update.message.text === i18n['ru'].message.premiumPlanFeatures(),
  )
  if (!premiumMenuMessage) {
    throw new Error(`There is no premium menu: ${JSON.stringify(premiumUpdates, null, 2)}`)
  }
  const oneMonthPremiumButton = premiumMenuMessage.message.reply_markup.keyboard.find(
    (row: KeyboardButton[]) => row.find(button => button === oneMonthPremiumButtonText),
  )
  if (!oneMonthPremiumButton) {
    throw new Error(
      `There is no button for one month subscription: ${JSON.stringify(premiumMenuMessage, null, 2)}`,
    )
  }
}
