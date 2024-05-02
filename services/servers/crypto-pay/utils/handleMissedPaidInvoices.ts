import { CryptoPay } from '@foile/crypto-pay-api'
import { selectPublisherActiveInvoices } from '../../../../utils/mysql-queries'
import { getDbConnection } from '../../../../utils'
import { TInvoice } from '../types'
import { handlePaidInvoice } from '.'

export const handleMissedPaidInvoices = async (cryptoPay: CryptoPay) => {
  const db = await getDbConnection()
  const activeInvoices = await selectPublisherActiveInvoices(db)
  const activeInvoiceIds = activeInvoices.map(invoice => invoice.id)
  const invoices: TInvoice[] = await cryptoPay.getInvoices({
    status: 'paid',
    invoice_ids: activeInvoiceIds,
  })
  invoices.forEach(async invoice => {
    const userId = invoice.description?.match(/\((.+)\)/)?.at(-1)
    await handlePaidInvoice(Number(userId), invoice.invoice_id)
  })
}
