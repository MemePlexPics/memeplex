import { botPublisherUsers } from '../../db/schema'
import { sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const insertPublisherUser = async (
  db: TDbConnection,
  values: typeof botPublisherUsers.$inferInsert,
) => {
  await db
    .insert(botPublisherUsers)
    .values(values)
    .onDuplicateKeyUpdate({ set: { id: sql`id` } })
}
