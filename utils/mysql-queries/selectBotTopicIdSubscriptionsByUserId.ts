import { botChannels, botTopicSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotTopicIdSubscriptionsByUserId = async (db: TDbConnection, userId: number) => {
  return await db
    .selectDistinct({
      topicId: botTopicSubscriptions.topicId,
    })
    .from(botTopicSubscriptions)
    .leftJoin(botChannels, eq(botChannels.id, botTopicSubscriptions.channelId))
    .where(eq(botChannels.userId, userId))
}
