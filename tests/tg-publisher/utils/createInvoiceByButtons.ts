import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { i18n } from '../../../services/servers/tg-bots/publisher/i18n'
import { getDbConnection } from '../../../utils'
import { selectBotActiveInvoices } from '../../../utils/mysql-queries'
import type { TelegramClientWrapper } from '.'
import { PREMIUM_PLANS } from '../../../constants/publisher'

export const createInvoiceByButtons = async (tgClient: TelegramClientWrapper) => {
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

  await tgClient.executeMessage(oneMonthPremiumButtonText)
  const afterPressPremiumButtonUpdates = await tgClient.getUpdates()
  console.log(JSON.stringify(afterPressPremiumButtonUpdates, null, 2))
  if (!afterPressPremiumButtonUpdates) {
    throw new Error(`There is no updates after pressed «${oneMonthPremiumButtonText}» button`)
  }
  const linkForPaymentMessage = afterPressPremiumButtonUpdates.result.find(
    update => update.message.text === i18n['ru'].message.paymentLink(),
  )
  if (!linkForPaymentMessage) {
    throw new Error(
      `There is no message to go to make a payment: ${JSON.stringify(afterPressPremiumButtonUpdates, null, 2)}`,
    )
  }
  const linkForPaymentButton = linkForPaymentMessage.message.reply_markup.inline_keyboard.find(
    (row: InlineKeyboardButton[]) =>
      row.find(button => 'url' in button && button.text === i18n['ru'].button.goToPremiumPayment()),
  )
  if (!linkForPaymentButton) {
    throw new Error(
      `There is no expected button in the message to go to make a payment: ${JSON.stringify(linkForPaymentMessage, null, 2)}`,
    )
  }
  const paymentHash = linkForPaymentButton[0].url.split('=').at(-1)
  const db = await getDbConnection()
  const activeInvoices = await selectBotActiveInvoices(db)
  await db.close()
  const findedInvoice = activeInvoices.find(invoice => invoice.hash === paymentHash)
  if (!findedInvoice) {
    throw new Error(`There is no active invoice for us: ${JSON.stringify(activeInvoices, null, 2)}`)
  }
  return findedInvoice
}
