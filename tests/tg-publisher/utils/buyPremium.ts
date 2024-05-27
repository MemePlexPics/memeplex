import {
  TelegramClientWrapper,
  awaitPremiumActivation,
  backToMainMenuAfterBoughtPremium,
  createInvoiceByButtons,
  goToOneMonthPremiumButton,
} from '.'

export const buyPremium = async (tgClient: TelegramClientWrapper) => {
  await goToOneMonthPremiumButton(tgClient)
  const currentInvoice = await createInvoiceByButtons(tgClient)
  await awaitPremiumActivation(tgClient, currentInvoice.id)
  await backToMainMenuAfterBoughtPremium(tgClient)
}
