import { eq, inArray } from 'drizzle-orm'
import { botTopics, botKeywords } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotTopicWithKeywordsByTopicIds = async (
  db: TDbConnection,
  topicIds: number[],
) => {
  return await db
    .select({
      id: botTopics.id,
      nameId: botTopics.nameId,
      keywordId: botTopics.keywordId,
      keyword: botKeywords.keyword,
    })
    .from(botTopics)
    .leftJoin(botKeywords, eq(botKeywords.id, botTopics.keywordId))
    .where(inArray(botTopics.nameId, topicIds))
}
