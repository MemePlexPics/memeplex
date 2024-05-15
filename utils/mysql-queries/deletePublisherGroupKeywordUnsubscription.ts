import { and, eq } from 'drizzle-orm'
import { botPublisherGroupKeywordUnsubscriptions } from '../../db/schema'
import { TDbConnection } from '../types'

export const deletePublisherGroupKeywordUnsubscription = async (
  db: TDbConnection,
  channelId: number,
  keyword: string,
) => {
  await db
    .delete(botPublisherGroupKeywordUnsubscriptions)
    .where(
      and(
        eq(botPublisherGroupKeywordUnsubscriptions.channelId, channelId),
        eq(botPublisherGroupKeywordUnsubscriptions.keyword, keyword),
      ),
    )
}
