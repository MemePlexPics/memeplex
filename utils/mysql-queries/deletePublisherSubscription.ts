import { botPublisherSubscriptions } from '../../db/schema'
import { and, eq, inArray } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const deletePublisherSubscription = async (
  db: TDbConnection,
  channelId: number,
  keywordIds: number[],
) => {
  await db
    .delete(botPublisherSubscriptions)
    .where(
      and(
        eq(botPublisherSubscriptions.channelId, channelId),
        inArray(botPublisherSubscriptions.keywordId, keywordIds),
      ),
    )
}
