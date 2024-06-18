import type { CryptoPay } from '@foile/crypto-pay-api'
import { selectBotActiveInvoices, updateBotInvoiceStatus } from '../../../../utils/mysql-queries'
import { getDbConnection } from '../../../../utils'
import type { TInvoice } from '../types'
import { handlePaidInvoice } from '.'
import { CRYPTOPAY_INVOICE_EXPIRES_IN_SECONDS } from '../../../../constants'

export const handlePaidInvoices = async (cryptoPay: CryptoPay) => {
  const db = await getDbConnection()
  const activeInvoices = await selectBotActiveInvoices(db)
  if (activeInvoices.length === 0) {
    return
  }
  const activeInvoiceIds = activeInvoices.map(invoice => invoice.id)
  const invoices: { items: TInvoice[] } = await cryptoPay.getInvoices({
    status: 'paid',
    invoice_ids: activeInvoiceIds,
  })
  invoices.items.forEach(async invoice => {
    const userId = invoice.description?.match(/\((.+)\)/)?.at(-1)
    if (!userId) {
      throw new Error(`There is no userId in an invoice description: ${JSON.stringify(invoice)}`)
    }
    await handlePaidInvoice(userId, invoice.invoice_id, invoice.amount)
  })
  if (invoices.items.length !== activeInvoices.length) {
    const paidInvoiceIds = invoices.items.map(invoice => invoice.invoice_id)
    activeInvoices.forEach(async activeInvoice => {
      if (!paidInvoiceIds.includes(activeInvoice.id)) {
        const expiredAt = new Date(activeInvoice.createdAt)
        expiredAt.setSeconds(expiredAt.getSeconds() + CRYPTOPAY_INVOICE_EXPIRES_IN_SECONDS)
        if (expiredAt < new Date()) {
          await updateBotInvoiceStatus(db, activeInvoice.id, 'expired')
        }
      }
    })
  }
  await db.close()
}
