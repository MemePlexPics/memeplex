import { botKeywords, botSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotSubscriptionsByChannelId = (db: TDbConnection, channelId: number) => {
  return db
    .select({
      keyword: botKeywords.keyword,
      keywordId: botSubscriptions.keywordId,
    })
    .from(botSubscriptions)
    .leftJoin(botKeywords, eq(botSubscriptions.keywordId, botKeywords.id))
    .where(eq(botSubscriptions.channelId, channelId))
    .orderBy(botSubscriptions.keywordId)
}
