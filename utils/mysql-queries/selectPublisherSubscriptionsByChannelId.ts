import { botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherSubscriptionsByChannelId = (db: TDbConnection, channelId: number) => {
  return db
    .select({ keyword: botPublisherSubscriptions.keyword })
    .from(botPublisherSubscriptions)
    .where(eq(botPublisherSubscriptions.channelId, channelId))
    .orderBy(botPublisherSubscriptions.keyword)
}
