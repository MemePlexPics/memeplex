import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherSubscriptions } from '../../db/schema'
import { count, eq } from 'drizzle-orm'

export const countPublisherSubscriptionsByChannelId = async (
  db: MySql2Database<Record<string, never>>,
  channelId: number
) => {
  const [response] = await db
    .select({ value: count() })
    .from(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.channelId, channelId))
  return response.value
}
