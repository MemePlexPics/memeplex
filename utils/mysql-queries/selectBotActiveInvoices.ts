import { eq } from 'drizzle-orm'
import { botInvoices } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotActiveInvoices = async (db: TDbConnection) => {
  return await db.select().from(botInvoices).where(eq(botInvoices.status, 'active'))
}
