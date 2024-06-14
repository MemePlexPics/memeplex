import { and, eq } from 'drizzle-orm'
import { proxies } from '../../db/schema'
import type { TDbConnection } from '../types'

export const updateProxyOcrKey = async (
  db: TDbConnection,
  ocrKey: string,
  proxy: `${string}:${number}`,
  protocol: string,
) => {
  await db
    .update(proxies)
    .set({ ocrKey })
    .where(and(eq(proxies.address, proxy), eq(proxies.protocol, protocol)))
}
