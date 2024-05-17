import { and, eq, inArray } from 'drizzle-orm'
import { botPublisherGroupKeywordUnsubscriptions, botPublisherKeywords } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectPublisherGroupKeywordUnsubscriptions = async (
  db: TDbConnection,
  channelIds: number[],
  keywords: string[],
) => {
  return await db
    .select({
      channelId: botPublisherGroupKeywordUnsubscriptions.channelId,
      keyword: botPublisherKeywords.keyword,
    })
    .from(botPublisherGroupKeywordUnsubscriptions)
    .leftJoin(
      botPublisherKeywords,
      eq(botPublisherKeywords.id, botPublisherGroupKeywordUnsubscriptions.keywordId),
    )
    .where(
      and(
        inArray(botPublisherGroupKeywordUnsubscriptions.channelId, channelIds),
        inArray(botPublisherKeywords.keyword, keywords),
      ),
    )
}
