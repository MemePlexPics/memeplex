import { botTopicSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deleteBotTopicSubscriptionByChannelId = async (
  db: TDbConnection,
  channelId: number,
) => {
  await db.delete(botTopicSubscriptions).where(eq(botTopicSubscriptions.channelId, channelId))
}
