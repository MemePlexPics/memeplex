import { botTopicSubscriptions } from '../../db/schema'
import { sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const insertBotTopicSubscription = async (
  db: TDbConnection,
  subscriptions: (typeof botTopicSubscriptions.$inferInsert)[],
) => {
  await db
    .insert(botTopicSubscriptions)
    .values(subscriptions)
    .onDuplicateKeyUpdate({ set: { id: sql`id` } })
}
