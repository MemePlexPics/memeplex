import { botUsers } from '../../db/schema'
import { sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const insertBotUser = async (db: TDbConnection, values: typeof botUsers.$inferInsert) => {
  await db
    .insert(botUsers)
    .values(values)
    .onDuplicateKeyUpdate({ set: { id: sql`id` } })
}
