import { botSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deleteBotSubscriptionsByKeywordId = async (db: TDbConnection, keywordId: number) => {
  await db.delete(botSubscriptions).where(eq(botSubscriptions.keywordId, keywordId))
}
