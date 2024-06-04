import { eq, sql } from 'drizzle-orm'
import { ocrKeysPro } from '../../db/schema'
import type { TDbConnection } from '../types'
import { OCR_SPACE_403_DELAY } from '../../constants'

export async function updateProKeyTimeout(db: TDbConnection, key: string) {
  await db.update(ocrKeysPro).set({ timeout: sql`DATE_ADD(NOW(), INTERVAL ${OCR_SPACE_403_DELAY}000 MINUTE)` }).where(eq(ocrKeysPro.ocrKey, key))
}
