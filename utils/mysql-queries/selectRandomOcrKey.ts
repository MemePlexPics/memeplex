import { ocrKeys } from '../../db/schema'
import { eq, or, sql } from 'drizzle-orm'
import { TDbConnection } from '../types'
import { OCR_SPACE_403_DELAY } from '../../constants'

export const selectRandomOcrKey = async (
  db: TDbConnection,
) => {
  return await db
    .select()
    .from(ocrKeys)
    .where(
      or(
        eq(ocrKeys.timeout, null),
        sql`'${ocrKeys.timeout}' < DATE_ADD(NOW(), INTERVAL ${OCR_SPACE_403_DELAY} MICROSECOND)`
      )
    )
    .orderBy(sql`RAND()`)
    .limit(1)
}
