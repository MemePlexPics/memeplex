import { botTopicSubscriptions } from '../../db/schema'
import { and, eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deleteBotTopicSubscription = async (
  db: TDbConnection,
  channelId: number,
  topicId: number,
) => {
  await db
    .delete(botTopicSubscriptions)
    .where(
      and(
        eq(botTopicSubscriptions.channelId, channelId),
        eq(botTopicSubscriptions.topicId, topicId),
      ),
    )
}
