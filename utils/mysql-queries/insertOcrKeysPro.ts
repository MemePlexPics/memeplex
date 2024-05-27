import { sql } from 'drizzle-orm'
import { ocrKeysPro } from '../../db/schema'
import type { TDbConnection } from '../types'

export const insertOcrKeysPro = async (
  db: TDbConnection,
  values: (typeof ocrKeysPro.$inferInsert)[],
) => {
  return await db
    .insert(ocrKeysPro)
    .values(values)
    .onDuplicateKeyUpdate({ set: { ocrKey: sql`ocr_key` } })
}
