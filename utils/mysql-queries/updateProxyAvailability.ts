import { and, eq, sql } from 'drizzle-orm'
import { proxies } from '../../db/schema'
import type { TDbConnection } from '../types'

export async function updateProxyAvailability(
  db: TDbConnection,
  proxy: `${string}:${number}`,
  protocol: string,
  availability: 0 | 1,
) {
  await db
    .update(proxies)
    .set({
      availability,
      lastActivityDatetime: sql`SELECT now()`,
    })
    .where(and(eq(proxies.address, proxy), eq(proxies.protocol, protocol)))
}
