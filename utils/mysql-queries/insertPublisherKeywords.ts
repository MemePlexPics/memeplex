import { botPublisherKeywords } from '../../db/schema'
import { sql } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const insertPublisherKeywords = async (
  db: TDbConnection,
  keywordValues: (typeof botPublisherKeywords.$inferInsert)[],
) => {
  await db
    .insert(botPublisherKeywords)
    .values(keywordValues)
    .onDuplicateKeyUpdate({ set: { keyword: sql`keyword` } })
}
