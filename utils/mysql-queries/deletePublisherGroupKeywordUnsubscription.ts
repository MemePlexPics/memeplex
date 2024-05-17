import { and, eq, inArray } from 'drizzle-orm'
import { botPublisherGroupKeywordUnsubscriptions } from '../../db/schema'
import { TDbConnection } from '../types'

export const deletePublisherGroupKeywordUnsubscription = async (
  db: TDbConnection,
  channelId: number,
  keywordIds: number[],
) => {
  await db
    .delete(botPublisherGroupKeywordUnsubscriptions)
    .where(
      and(
        eq(botPublisherGroupKeywordUnsubscriptions.channelId, channelId),
        inArray(botPublisherGroupKeywordUnsubscriptions.keywordId, keywordIds),
      ),
    )
}
