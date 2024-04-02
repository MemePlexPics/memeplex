import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherSubscriptions } from '../../db/schema'
import { and, eq } from 'drizzle-orm'

export const deletePublisherSubscription = async (
  db: MySql2Database<Record<string, never>>,
  channelId: number,
  keyword: string
) => {
  await db
    .delete(botPublisherSubscriptions)
    .where(
      and(
        eq(botPublisherSubscriptions.keyword, keyword),
        eq(botPublisherSubscriptions.channelId, channelId)
      )
    )
}
