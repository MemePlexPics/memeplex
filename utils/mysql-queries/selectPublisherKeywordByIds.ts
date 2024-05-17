import { botPublisherKeywords } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherKeywordByIds = async (db: TDbConnection, keywordIds: number[]) => {
  return await db
    .select()
    .from(botPublisherKeywords)
    .where(inArray(botPublisherKeywords.id, keywordIds))
}
