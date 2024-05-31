import {
  botKeywords,
  botTopicNames,
  botTopicSubscriptions,
  botTopics,
} from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotTopicSubscriptionKeywordsByChannelId = (
  db: TDbConnection,
  channelId: number,
) => {
  return db
    .select({
      keyword: botKeywords.keyword,
      keywordId: botTopics.keywordId,
      topic: botTopicNames.name,
      topicId: botTopicSubscriptions.topicId,
    })
    .from(botTopicSubscriptions)
    .where(eq(botTopicSubscriptions.channelId, channelId))
    .leftJoin(botTopicNames, eq(botTopicNames.id, botTopicSubscriptions.topicId))
    .leftJoin(botTopics, eq(botTopics.nameId, botTopicNames.id))
    .leftJoin(botKeywords, eq(botTopics.keywordId, botTopics.keywordId))
    .orderBy(botTopicNames.name, botKeywords.keyword)
}
