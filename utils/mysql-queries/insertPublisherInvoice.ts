import { botPublisherInvoices } from '../../db/schema'
import { TDbConnection } from '../types'

export const insertPublisherInvoice = async (
  db: TDbConnection,
  values: typeof botPublisherInvoices.$inferInsert,
) => {
  return await db.insert(botPublisherInvoices).values(values)
}
