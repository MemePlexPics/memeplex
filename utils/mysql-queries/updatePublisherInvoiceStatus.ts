import { eq } from 'drizzle-orm'
import { botPublisherInvoices } from '../../db/schema'
import { TDbConnection } from '../types'

export const updatePublisherInvoiceStatus = async (
  db: TDbConnection,
  invoiceId: number,
  status: (typeof botPublisherInvoices.$inferInsert)['status'],
) => {
  return await db
    .update(botPublisherInvoices)
    .set({
      status,
    })
    .where(eq(botPublisherInvoices.id, invoiceId))
}
