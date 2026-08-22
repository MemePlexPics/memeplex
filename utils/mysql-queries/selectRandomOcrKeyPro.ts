import { ocrKeysPro } from '../../db/schema'
import { isNull, or, sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectRandomOcrKeyPro = async (db: TDbConnection) => {
  return await db
    .select()
    .from(ocrKeysPro)
    .where(
      or(
        isNull(ocrKeysPro.timeout),
        sql`${ocrKeysPro.timeout} < NOW()`,
      ),
    )
    .orderBy(sql`RAND()`)
    .limit(1)
}
