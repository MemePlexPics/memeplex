import { eq } from 'drizzle-orm'
import { botPublisherInvoices, botPublisherUserPremiums } from '../../../db/schema'
import { TDbConnection } from '../../../utils/types'
import { selectPublisherActiveInvoices } from '../../../utils/mysql-queries'
import { CryptoPay } from '@foile/crypto-pay-api'

export const cleanUpPublisherPremium = async (
  db: TDbConnection,
  cryptoPay: CryptoPay,
  userId: number = 1,
) => {
  await db.delete(botPublisherUserPremiums).where(eq(botPublisherUserPremiums.userId, userId))
  const activeInvoices = await selectPublisherActiveInvoices(db)
  const testUserInvoices = activeInvoices.filter(invoice => invoice.userId === userId)
  if (testUserInvoices.length) {
    const invoiceIds = testUserInvoices.map(invoice => invoice.id)
    for (const invoiceId of invoiceIds) {
      await cryptoPay.callApi('deleteInvoice', { invoice_id: invoiceId })
    }
  }
  await db.delete(botPublisherInvoices).where(eq(botPublisherInvoices.userId, userId))
}
