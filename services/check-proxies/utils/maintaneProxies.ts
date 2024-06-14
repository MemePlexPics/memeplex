import type { Logger } from 'winston'
import { checkProxyArray } from '.'
import type { TDbConnection } from '../../../utils/types'
import { proxies } from '../../../db/schema'
import { and, desc, eq, ne, sql } from 'drizzle-orm'

export const maintaneProxies = async (
  db: TDbConnection,
  ipWithoutProxy: string,
  logger: Logger,
) => {
  const proxiesForRecheck = await db
    .select()
    .from(proxies)
    .where(
      and(
        ne(proxies.anonymity, 'transparent'),
        eq(proxies.availability, 1),
        sql`${proxies.lastCheckDatetime} <= DATE_SUB(NOW(), INTERVAL 1 HOUR)`,
      ),
    )
    .orderBy(
      proxies.lastCheckDatetime,
      desc(proxies.ocrKey),
      desc(proxies.lastActivityDatetime),
      proxies.speed,
    )
    .limit(1)
  const proxiesForResurrection = await db
    .select()
    .from(proxies)
    .where(and(ne(proxies.anonymity, 'transparent'), eq(proxies.availability, 0)))
    .orderBy(
      proxies.lastCheckDatetime,
      desc(proxies.ocrKey),
      desc(proxies.lastActivityDatetime),
      proxies.speed,
    )
    .limit(1)
  await checkProxyArray(
    db,
    [...proxiesForRecheck, ...proxiesForResurrection],
    ipWithoutProxy,
    logger,
  )
}
