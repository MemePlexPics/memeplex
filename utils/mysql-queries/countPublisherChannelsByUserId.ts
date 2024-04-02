import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherChannels } from '../../db/schema'
import { count, eq } from 'drizzle-orm'

export const countPublisherChannelsByUserId = async (
  db: MySql2Database<Record<string, never>>,
  userId: number
) => {
  return await db
    .select({ values: count() })
    .from(botPublisherChannels)
    .where(eq(botPublisherChannels.userId, userId))
}
