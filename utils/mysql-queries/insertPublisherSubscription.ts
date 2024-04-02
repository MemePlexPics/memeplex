import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherSubscriptions } from '../../db/schema'
import { sql } from 'drizzle-orm'

export const insertPublisherSubscription = async (
  db: MySql2Database<Record<string, never>>,
  subscriptions: (typeof botPublisherSubscriptions.$inferInsert)[]
) => {
  await db
    .insert(botPublisherSubscriptions)
    .values(subscriptions)
    .onDuplicateKeyUpdate({ set: { id: sql`id` } })
}
