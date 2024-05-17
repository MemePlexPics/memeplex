import { eq } from 'drizzle-orm'
import { botPublisherKeywordGroups, botPublisherKeywords } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectPublisherKeywordGroupWithKeywords = async (db: TDbConnection) => {
  return await db
    .select({
      id: botPublisherKeywordGroups.id,
      groupId: botPublisherKeywordGroups.groupId,
      keywordId: botPublisherKeywordGroups.keywordId,
      keyword: botPublisherKeywords.keyword,
    })
    .from(botPublisherKeywordGroups)
    .leftJoin(
      botPublisherKeywords,
      eq(botPublisherKeywords.id, botPublisherKeywordGroups.keywordId),
    )
}
