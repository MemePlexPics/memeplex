import { and, eq, inArray } from 'drizzle-orm'
import { botTopicKeywordUnsubscriptions, botKeywords } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotTopicKeywordUnsubscriptions = async (
  db: TDbConnection,
  channelIds: number[],
  keywords: string[],
) => {
  return await db
    .select({
      channelId: botTopicKeywordUnsubscriptions.channelId,
      keyword: botKeywords.keyword,
    })
    .from(botTopicKeywordUnsubscriptions)
    .leftJoin(botKeywords, eq(botKeywords.id, botTopicKeywordUnsubscriptions.keywordId))
    .where(
      and(
        inArray(botTopicKeywordUnsubscriptions.channelId, channelIds),
        inArray(botKeywords.keyword, keywords),
      ),
    )
}
