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
    .selectDistinct({
      keyword: botKeywords.keyword,
      keywordId: botTopics.keywordId,
      topic: botTopicNames.name,
      topicId: botTopicSubscriptions.topicId,
    })
    .from(botTopicSubscriptions)
    .leftJoin(botTopicNames, eq(botTopicNames.id, botTopicSubscriptions.topicId))
    .leftJoin(botTopics, eq(botTopics.nameId, botTopicNames.id))
    .leftJoin(botKeywords, eq(botTopics.keywordId, botTopics.keywordId))
    .where(eq(botTopicSubscriptions.channelId, channelId))
    .orderBy(botTopicNames.name, botKeywords.keyword)
}
