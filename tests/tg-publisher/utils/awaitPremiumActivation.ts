import { TelegramClientWrapper } from '.'
import { PREMIUM_PLANS } from '../../../constants/publisher'
import { handlePaidInvoice } from '../../../services/servers/crypto-pay/utils'
import { i18n } from '../../../services/servers/tg-bots/publisher/i18n'
import { delay } from '../../../utils'

export const awaitPremiumActivation = async (
  tgClient: TelegramClientWrapper,
  invoiceId: number,
) => {
  const oneMonthPremium = PREMIUM_PLANS.find(plan => plan.months === 1)
  await handlePaidInvoice(1, invoiceId, `${oneMonthPremium?.cost}`)
  await delay(3_000)
  const updatesWithSuccessfulPaymentMessage = await tgClient.getUpdates()
  const successfulPaymentMessage = updatesWithSuccessfulPaymentMessage.result.find(
    update => update.message.text === i18n['ru'].message.paymentSuccessful(),
  )
  expect(successfulPaymentMessage).not.toBe(undefined)
}
