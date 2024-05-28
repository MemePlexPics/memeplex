import { ocrKeys } from '../../db/schema'
import { isNull, or, sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'
import { OCR_SPACE_403_DELAY } from '../../constants'

export const selectRandomOcrKey = async (db: TDbConnection) => {
  return await db
    .select()
    .from(ocrKeys)
    .where(
      or(
        isNull(ocrKeys.timeout),
        sql`'${ocrKeys.timeout}' < DATE_ADD(NOW(), INTERVAL ${OCR_SPACE_403_DELAY}000 MICROSECOND)`,
      ),
    )
    .orderBy(sql`RAND()`)
    .limit(1)
}
