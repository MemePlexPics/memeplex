import { botPublisherSubscriptions } from '../../db/schema'
import { count, eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const countPublisherSubscriptionsByChannelId = async (
  db: TDbConnection,
  channelId: number,
) => {
  const [response] = await db
    .select({ value: count() })
    .from(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.channelId, channelId))
  return response.value
}
