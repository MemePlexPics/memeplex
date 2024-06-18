import { botKeywords } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotKeywordsByKeywords = async (db: TDbConnection, keywords: string[]) => {
  return await db.select().from(botKeywords).where(inArray(botKeywords.keyword, keywords))
}
