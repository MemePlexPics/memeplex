import { ocrKeysPro } from '../../db/schema'
import { isNull, or, sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'
import { OCR_SPACE_403_DELAY } from '../../constants'

export const selectRandomOcrKeyPro = async (db: TDbConnection) => {
  return await db
    .select()
    .from(ocrKeysPro)
    .where(
      or(
        isNull(ocrKeysPro.timeout),
        sql`'${ocrKeysPro.timeout}' < DATE_ADD(NOW(), INTERVAL ${OCR_SPACE_403_DELAY}000 MICROSECOND)`,
      ),
    )
    .orderBy(sql`RAND()`)
    .limit(1)
}
