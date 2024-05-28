import { proxies } from '../../db/schema'
import { and, eq, inArray, isNull } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectFastestAvailableProxyWithoutKey = async (db: TDbConnection) => {
  return await db
    .select()
    .from(proxies)
    .where(
      and(
        inArray(proxies.anonymity, ['anonymous', 'elite']),
        eq(proxies.availability, 1),
        isNull(proxies.ocrKey),
      ),
    )
    .orderBy(proxies.speed)
    .limit(1)
}
