import { botKeywords, botSubscriptions } from '../../db/schema'
import { eq, inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotSubscriptionsByKeywords = async (db: TDbConnection, keywords: string[]) => {
  return await db
    .select({
      channelId: botSubscriptions.channelId,
      keyword: botKeywords.keyword,
    })
    .from(botSubscriptions)
    .leftJoin(botKeywords, eq(botKeywords.id, botSubscriptions.keywordId))
    .where(inArray(botKeywords.keyword, keywords))
}
