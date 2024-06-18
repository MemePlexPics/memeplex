import { eq } from 'drizzle-orm'
import { botInvoices } from '../../db/schema'
import type { TDbConnection } from '../types'

export const updateBotInvoiceStatus = async (
  db: TDbConnection,
  invoiceId: number,
  status: (typeof botInvoices.$inferInsert)['status'],
) => {
  return await db
    .update(botInvoices)
    .set({
      status,
    })
    .where(eq(botInvoices.id, invoiceId))
}
