import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deletePublisherSubscriptionsByKeywordId = async (
  db: TDbConnection,
  keywordId: number,
) => {
  await db
    .delete(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.keywordId, keywordId))
}
