import { botPublisherKeywords, botPublisherSubscriptions } from '../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherSubscriptionsByKeywords = async (
  db: TDbConnection,
  keywords: string[],
) => {
  return await db
    .select({
      channelId: botPublisherSubscriptions.channelId,
      keyword: botPublisherKeywords.keyword,
    })
    .from(botPublisherSubscriptions)
    .leftJoin(
      botPublisherKeywords,
      eq(botPublisherKeywords.id, botPublisherSubscriptions.keywordId),
    )
    .where(inArray(botPublisherKeywords.keyword, keywords))
}
