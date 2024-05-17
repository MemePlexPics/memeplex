import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const deletePublisherSubscriptionsByKeywordId = async (
  db: TDbConnection,
  keywordId: number,
) => {
  await db
    .delete(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.keywordId, keywordId))
}
