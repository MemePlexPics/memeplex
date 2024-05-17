import { botPublisherGroupSubscriptions } from '../../db/schema'
import { and, eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const deletePublisherGroupSubscription = async (
  db: TDbConnection,
  channelId: number,
  groupId: number,
) => {
  await db
    .delete(botPublisherGroupSubscriptions)
    .where(
      and(
        eq(botPublisherGroupSubscriptions.channelId, channelId),
        eq(botPublisherGroupSubscriptions.groupId, groupId),
      ),
    )
}
