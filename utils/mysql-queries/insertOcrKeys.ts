import { sql } from 'drizzle-orm'
import { ocrKeys } from '../../db/schema'
import { TDbConnection } from '../types'

export const insertOcrKeys = async (db: TDbConnection, values: (typeof ocrKeys.$inferInsert)[]) => {
  return await db
    .insert(ocrKeys)
    .values(values)
    .onDuplicateKeyUpdate({ set: { ocrKey: sql`ocr_key` } })
}
