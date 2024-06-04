import { eq, sql } from 'drizzle-orm'
import { ocrKeys } from '../../db/schema'
import type { TDbConnection } from '../types'
import { OCR_SPACE_403_DELAY } from '../../constants'

export async function updateKeyTimeout(db: TDbConnection, key: string) {
  await db.update(ocrKeys).set({ timeout: sql`DATE_ADD(NOW(), INTERVAL ${OCR_SPACE_403_DELAY}000 MINUTE)` }).where(eq(ocrKeys.ocrKey, key))
}
