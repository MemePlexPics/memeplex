import { botSubscriptions } from '../../db/schema'
import { sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const insertBotSubscription = async (
  db: TDbConnection,
  subscriptions: (typeof botSubscriptions.$inferInsert)[],
) => {
  await db
    .insert(botSubscriptions)
    .values(subscriptions)
    .onDuplicateKeyUpdate({ set: { id: sql`id` } })
}
