import { botInvoices } from '../../db/schema'
import type { TDbConnection } from '../types'

export const insertBotInvoice = async (
  db: TDbConnection,
  values: typeof botInvoices.$inferInsert,
) => {
  return await db.insert(botInvoices).values(values)
}
