import { eq } from 'drizzle-orm'
import { botTopics, botKeywords } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotTopicWithKeywords = async (db: TDbConnection) => {
  return await db
    .select({
      nameId: botTopics.nameId,
      keywordId: botTopics.keywordId,
      keyword: botKeywords.keyword,
    })
    .from(botTopics)
    .leftJoin(botKeywords, eq(botKeywords.id, botTopics.keywordId))
}
