import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const deletePublisherSubscriptionsByChannelId = async (
  db: TDbConnection,
  channelId: number
) => {
  await db
    .delete(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.channelId, channelId))
}
