import { botPublisherGroupSubscriptions } from '../../db/schema'
import { sql } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const insertPublisherGroupSubscription = async (
  db: TDbConnection,
  subscriptions: (typeof botPublisherGroupSubscriptions.$inferInsert)[],
) => {
  await db
    .insert(botPublisherGroupSubscriptions)
    .values(subscriptions)
    .onDuplicateKeyUpdate({ set: { id: sql`id` } })
}
