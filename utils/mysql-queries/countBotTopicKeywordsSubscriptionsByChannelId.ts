import { botKeywords, botTopicSubscriptions, botTopics } from '../../db/schema'
import { count, eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const countBotTopicKeywordsSubscriptionsByChannelId = async (
  db: TDbConnection,
  channelId: number,
) => {
  const [response] = await db
    .select({ value: count() })
    .from(botTopicSubscriptions)
    .leftJoin(botTopics, eq(botTopics.nameId, botTopicSubscriptions.topicId))
    .leftJoin(botKeywords, eq(botKeywords.id, botTopics.keywordId))
    .where(eq(botTopicSubscriptions.channelId, channelId))
  return response.value
}
