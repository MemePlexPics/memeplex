import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherSubscriptionsByChannelId = async (
  db: TDbConnection,
  channelId: number
) => {
  return await db
    .select({ keyword: botPublisherSubscriptions.keyword })
    .from(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.channelId, channelId))
}
