import { proxies } from '../../db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectFastestAvailableProxyWithExactKey = async (db: TDbConnection, key: string) => {
  return await db
    .select()
    .from(proxies)
    .where(
      and(
        inArray(proxies.anonymity, ['anonymous', 'elite']),
        eq(proxies.availability, 1),
        eq(proxies.ocrKey, key),
      ),
    )
    .orderBy(proxies.speed)
    .limit(1)
}
