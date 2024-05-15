import { and, eq } from 'drizzle-orm'
import { proxies } from '../../db/schema'
import { TDbConnection } from '../types'

export async function selectExistedProxy(db: TDbConnection, proxy: string, protocol: string) {
  const result = await db
    .select()
    .from(proxies)
    .where(and(eq(proxies.address, proxy), eq(proxies.protocol, protocol)))
    .limit(1)
  return result
}
