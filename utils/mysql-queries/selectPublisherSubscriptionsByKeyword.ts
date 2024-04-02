import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const selectPublisherSubscriptionsByKeyword = async (
  db: MySql2Database<Record<string, never>>,
  keyword: string
) => {
  return await db
    .select()
    .from(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.keyword, keyword))
}
