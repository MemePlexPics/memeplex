import { botTopicSubscriptions, botTopics } from '../../db/schema'
import { count, eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const countBotTopicKeywordsSubscriptionsByChannelId = async (
  db: TDbConnection,
  channelId: number,
) => {
  const [response] = await db
    .select({ value: count(botTopics.keywordId) })
    .from(botTopicSubscriptions)
    .leftJoin(botTopics, eq(botTopics.nameId, botTopicSubscriptions.topicId))
    .where(eq(botTopicSubscriptions.channelId, channelId))
  return response.value
}
