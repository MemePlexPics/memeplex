import { ocrKeysPro } from '../../db/schema'
import { eq, or, sql } from 'drizzle-orm'
import { TDbConnection } from '../types'
import { OCR_SPACE_403_DELAY } from '../../constants'

export const selectRandomOcrKeyPro = async (
  db: TDbConnection,
) => {
  return await db
    .select()
    .from(ocrKeysPro)
    .where(
      or(
        eq(ocrKeysPro.timeout, null),
        sql`'${ocrKeysPro.timeout}' < DATE_ADD(NOW(), INTERVAL ${OCR_SPACE_403_DELAY} MICROSECOND)`
      )
    )
    .orderBy(sql`RAND()`)
    .limit(1)
}
