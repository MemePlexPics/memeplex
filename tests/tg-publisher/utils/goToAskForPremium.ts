import type { KeyboardButton } from 'telegraf/typings/core/types/typegram'
import type { TelegramClientWrapper } from '.'
import { i18n } from '../../../services/servers/tg-bots/pics/i18n'

export const goToAskForPremium = async (tgClient: TelegramClientWrapper) => {
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
    update => update.message.text.trim() === i18n['ru'].message.premiumPlanFeatures().trim(),
  )
  if (!premiumMenuMessage) {
    throw new Error(`There is no premium menu: ${JSON.stringify(premiumUpdates, null, 2)}`)
  }
  const keyboardButtons = premiumMenuMessage.message.reply_markup.keyboard.flat() as string[]
  const durationButton = keyboardButtons.find(
    button => /\$/.test(button) || /\d+\s*\$/.test(button),
  )
  if (durationButton) {
    throw new Error(
      `Premium duration selection should be removed: ${JSON.stringify(premiumMenuMessage, null, 2)}`,
    )
  }
  const askForPremiumButton = keyboardButtons.find(
    button => button === i18n['ru'].button.askForPremium(),
  )
  if (!askForPremiumButton) {
    throw new Error(
      `There is no «${i18n['ru'].button.askForPremium()}» button: ${JSON.stringify(premiumMenuMessage, null, 2)}`,
    )
  }
  return premiumMenuMessage
}
