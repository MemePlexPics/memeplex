import { botKeywords } from '../../db/schema'
import { sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const insertBotKeywords = async (
  db: TDbConnection,
  keywordValues: (typeof botKeywords.$inferInsert)[],
) => {
  await db
    .insert(botKeywords)
    .values(keywordValues)
    .onDuplicateKeyUpdate({ set: { keyword: sql`keyword` } })
}
