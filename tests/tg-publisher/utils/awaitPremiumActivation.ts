import type { TelegramClientWrapper } from '.'
import { PREMIUM_PLANS } from '../../../constants/publisher'
import { handlePaidInvoice } from '../../../services/servers/crypto-pay/utils'
import { i18n } from '../../../services/servers/tg-bots/pics/i18n'
import { delay } from '../../../utils'

export const awaitPremiumActivation = async (
  tgClient: TelegramClientWrapper,
  invoiceId: number,
) => {
  const oneMonthPremium = PREMIUM_PLANS.find(plan => plan.months === 1)
  await handlePaidInvoice(1, invoiceId, `${oneMonthPremium?.cost}`)
  await delay(3_000)
  const updatesWithSuccessfulPaymentMessage = await tgClient.getUpdates()
  const paymentSuccessful = i18n['ru'].message.paymentSuccessful('').split('.')[0]
  const successfulPaymentMessage = updatesWithSuccessfulPaymentMessage.result.find(update =>
    update.message.text.startsWith(paymentSuccessful),
  )
  console.log(JSON.stringify(successfulPaymentMessage, null, 2))
  expect(successfulPaymentMessage).not.toBe(undefined)
}
