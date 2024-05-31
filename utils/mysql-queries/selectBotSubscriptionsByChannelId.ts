import {
  botKeywords,
  botSubscriptions,
  botTopicNames,
  botTopicSubscriptions,
  botTopics,
} from '../../db/schema'
import { eq, or } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotSubscriptionsByChannelId = (db: TDbConnection, channelId: number) => {
  return db
    .select({
      keyword: botKeywords.keyword,
      keywordId: botKeywords.id,
      topic: botTopicNames.name,
      topicId: botTopicNames.id,
    })
    .from(botSubscriptions)
    .leftJoin(botTopicSubscriptions, eq(botTopicSubscriptions.channelId, channelId))
    .leftJoin(botTopicNames, eq(botTopicNames.id, botTopicSubscriptions.topicId))
    .leftJoin(botTopics, eq(botTopics.nameId, botTopicNames.id))
    .leftJoin(botKeywords, or(
      eq(botSubscriptions.keywordId, botKeywords.id),
      eq(botTopics.keywordId, botKeywords.id),
    ))
    .where(or(
      eq(botSubscriptions.channelId, channelId),
      eq(botTopicSubscriptions.channelId, channelId)
    ))
    .orderBy(botSubscriptions.keywordId)
}
