import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const deletePublisherSubscriptionsByChannelId = async (
  db: MySql2Database<Record<string, never>>,
  channelId: number
) => {
  await db
    .delete(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.channelId, channelId))
}
