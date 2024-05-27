import { eq } from 'drizzle-orm'
import { botPublisherInvoices } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectPublisherActiveInvoices = async (db: TDbConnection) => {
  return await db
    .select()
    .from(botPublisherInvoices)
    .where(eq(botPublisherInvoices.status, 'active'))
}
