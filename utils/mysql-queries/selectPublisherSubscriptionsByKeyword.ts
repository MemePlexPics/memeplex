import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherSubscriptionsByKeyword = async (db: TDbConnection, keyword: string) => {
  return await db
    .select()
    .from(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.keyword, keyword))
}
