import { botPublisherChannels, botPublisherGroupSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectPublisherGroupIdSubscriptionsByUserId = async (
  db: TDbConnection,
  userId: number,
) => {
  return await db
    .selectDistinct({
      groupId: botPublisherGroupSubscriptions.groupId,
    })
    .from(botPublisherGroupSubscriptions)
    .leftJoin(
      botPublisherChannels,
      eq(botPublisherChannels.id, botPublisherGroupSubscriptions.channelId),
    )
    .where(eq(botPublisherChannels.userId, userId))
}
