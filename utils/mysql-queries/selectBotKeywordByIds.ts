import { botKeywords } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotKeywordByIds = async (db: TDbConnection, keywordIds: number[]) => {
  return await db.select().from(botKeywords).where(inArray(botKeywords.id, keywordIds))
}
