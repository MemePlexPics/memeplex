import { botPublisherKeywords, botPublisherSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherSubscriptionsByChannelId = (db: TDbConnection, channelId: number) => {
  return db
    .select({
      id: botPublisherKeywords.id,
      keyword: botPublisherKeywords.keyword,
    })
    .from(botPublisherSubscriptions)
    .leftJoin(
      botPublisherKeywords,
      eq(botPublisherSubscriptions.keywordId, botPublisherKeywords.id),
    )
    .where(eq(botPublisherSubscriptions.channelId, channelId))
    .orderBy(botPublisherSubscriptions.keywordId)
}
