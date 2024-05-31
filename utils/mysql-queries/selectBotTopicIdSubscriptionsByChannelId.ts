import { botTopicSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotTopicIdSubscriptionsByChannelId = async (db: TDbConnection, channelId: number) => {
  return await db
    .select({
      topicId: botTopicSubscriptions.topicId,
    })
    .from(botTopicSubscriptions)
    .where(eq(botTopicSubscriptions.channelId, channelId))
}
