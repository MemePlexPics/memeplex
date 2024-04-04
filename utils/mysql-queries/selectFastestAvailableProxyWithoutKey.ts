import { proxies } from '../../db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectFastestAvailableProxyWithoutKey = async (db: TDbConnection) => {
  return await db
    .select()
    .from(proxies)
    .where(
      and(
        inArray(proxies.anonymity, ['anonymous', 'elite']),
        eq(proxies.availability, true),
        eq(proxies.ocrKey, null),
      ),
    )
    .orderBy(proxies.speed)
    .limit(1)
}
