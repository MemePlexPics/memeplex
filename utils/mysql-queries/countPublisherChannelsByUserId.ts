import { botPublisherChannels } from '../../db/schema'
import { count, eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const countPublisherChannelsByUserId = async (
  db: TDbConnection,
  userId: number
) => {
  const [response] = await db
    .select({ values: count() })
    .from(botPublisherChannels)
    .where(eq(botPublisherChannels.userId, userId))
  return response.values
}
