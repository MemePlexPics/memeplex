import { botTopicSubscriptions, botTopics } from '../../db/schema'
import { count, eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const countBotTopicKeywordsSubscriptionsByChannelId = async (
  db: TDbConnection,
  channelId: number,
) => {
  const [response] = await db
    .select({ value: count() })
    .from(botTopicSubscriptions)
    .leftJoin(botTopics, eq(botTopicSubscriptions.topicId, botTopics.nameId))
    .where(eq(botTopicSubscriptions.channelId, channelId))
  return response.value
}
