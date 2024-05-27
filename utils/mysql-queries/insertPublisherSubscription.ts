import { botPublisherSubscriptions } from '../../db/schema'
import { sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const insertPublisherSubscription = async (
  db: TDbConnection,
  subscriptions: (typeof botPublisherSubscriptions.$inferInsert)[],
) => {
  await db
    .insert(botPublisherSubscriptions)
    .values(subscriptions)
    .onDuplicateKeyUpdate({ set: { id: sql`id` } })
}
