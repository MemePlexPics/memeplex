import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const deletePublisherSubscriptionsByKeyword = async (
  db: TDbConnection,
  keyword: string
) => {
  await db
    .delete(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.keyword, keyword))
}
