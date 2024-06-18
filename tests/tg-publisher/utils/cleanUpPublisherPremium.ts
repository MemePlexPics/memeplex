import { eq } from 'drizzle-orm'
import { botInvoices, botUserPremiums } from '../../../db/schema'
import type { TDbConnection } from '../../../utils/types'
import { selectBotActiveInvoices } from '../../../utils/mysql-queries'
import type { CryptoPay } from '@foile/crypto-pay-api'

export const cleanUpPublisherPremium = async (
  db: TDbConnection,
  cryptoPay: CryptoPay,
  userId: number = 1,
) => {
  await db.delete(botUserPremiums).where(eq(botUserPremiums.userId, userId))
  const activeInvoices = await selectBotActiveInvoices(db)
  const testUserInvoices = activeInvoices.filter(invoice => invoice.userId === userId)
  if (testUserInvoices.length) {
    const invoiceIds = testUserInvoices.map(invoice => invoice.id)
    for (const invoiceId of invoiceIds) {
      await cryptoPay.callApi('deleteInvoice', { invoice_id: invoiceId })
    }
  }
  await db.delete(botInvoices).where(eq(botInvoices.userId, userId))
}
