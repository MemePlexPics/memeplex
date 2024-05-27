import { botPublisherGroupSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deletePublisherGroupSubscriptionByChannelId = async (
  db: TDbConnection,
  channelId: number,
) => {
  await db
    .delete(botPublisherGroupSubscriptions)
    .where(eq(botPublisherGroupSubscriptions.channelId, channelId))
}
