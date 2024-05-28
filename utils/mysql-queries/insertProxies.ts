import { proxies } from '../../db/schema'
import type { TDbConnection } from '../types'

export async function insertProxies(db: TDbConnection, values: (typeof proxies.$inferInsert)[]) {
  await db.insert(proxies).values(values)
}
