import { proxies } from '../../db/schema'
import { TDbConnection } from '../types'

export async function insertProxies(db: TDbConnection, values: (typeof proxies.$inferInsert)[]) {
  await db.insert(proxies).values(values)
}
