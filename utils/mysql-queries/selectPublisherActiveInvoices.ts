import { eq } from 'drizzle-orm'
import { botPublisherInvoices } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectPublisherActiveInvoices = async (db: TDbConnection) => {
  return await db
    .select()
    .from(botPublisherInvoices)
    .where(eq(botPublisherInvoices.status, 'active'))
}
