import { botPublisherChannels, botPublisherGroupSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherGroupSubscriptionsByUserId = async (
  db: TDbConnection,
  userId: number,
) => {
  return await db
    .selectDistinct({
      groupName: botPublisherGroupSubscriptions.groupName,
    })
    .from(botPublisherGroupSubscriptions)
    .leftJoin(
      botPublisherChannels,
      eq(botPublisherChannels.id, botPublisherGroupSubscriptions.channelId),
    )
    .where(eq(botPublisherChannels.userId, userId))
}
