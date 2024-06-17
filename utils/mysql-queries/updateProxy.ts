import { and, eq } from 'drizzle-orm'
import { proxies } from '../../db/schema'
import type { TDbConnection } from '../types'

export const updateProxy = async (
  db: TDbConnection,
  values: Partial<typeof proxies.$inferInsert> &
  Pick<typeof proxies.$inferInsert, 'address' | 'protocol'>,
) => {
  await db
    .update(proxies)
    .set(values)
    .where(and(eq(proxies.address, values.address), eq(proxies.protocol, values.protocol)))
}
