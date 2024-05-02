import { CryptoPay } from '@foile/crypto-pay-api'
import { selectPublisherActiveInvoices } from '../../../../utils/mysql-queries'
import { getDbConnection } from '../../../../utils'
import { TInvoice } from '../types'
import { handlePaidInvoice } from '.'

export const handleMissedPaidInvoices = async (cryptoPay: CryptoPay) => {
  const db = await getDbConnection()
  const activeInvoices = await selectPublisherActiveInvoices(db)
  const activeInvoiceIds = activeInvoices.map(invoice => invoice.id)
  const invoices: { items: TInvoice[] } = await cryptoPay.getInvoices({
    status: 'paid',
    invoice_ids: activeInvoiceIds,
  })
  invoices.items.forEach(async invoice => {
    const userId = invoice.description?.match(/\((.+)\)/)?.at(-1)
    if (!userId) {
      throw new Error(
        `There is no userId in an invoice description: ${JSON.stringify(invoice)}`,
      )
    }
    await handlePaidInvoice(Number(userId), invoice.invoice_id)
  })
}
