import {
  botKeywords,
  botSubscriptions,
  botTopicNames,
  botTopicSubscriptions,
} from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotSubscriptionsByChannelId = (db: TDbConnection, channelId: number) => {
  return db
    .select({
      keywordId: botSubscriptions.keywordId,
      keyword: botKeywords.keyword,
      topicId: botTopicSubscriptions.topicId,
      topicName: botTopicNames.name,
    })
    .from(botSubscriptions)
    .leftJoin(botKeywords, eq(botSubscriptions.keywordId, botKeywords.id))
    .leftJoin(botTopicSubscriptions, eq(botTopicSubscriptions.channelId, channelId))
    .leftJoin(botTopicNames, eq(botTopicNames.id, botTopicSubscriptions.topicId))
    .where(eq(botSubscriptions.channelId, channelId))
    .orderBy(botSubscriptions.keywordId)
}
