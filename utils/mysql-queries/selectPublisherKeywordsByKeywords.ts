import { botPublisherKeywords } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherKeywordsByKeywords = async (db: TDbConnection, keywords: string[]) => {
  return await db
    .select()
    .from(botPublisherKeywords)
    .where(inArray(botPublisherKeywords.keyword, keywords))
}
