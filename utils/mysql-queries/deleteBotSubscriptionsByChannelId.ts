import { botSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deleteBotSubscriptionsByChannelId = async (db: TDbConnection, channelId: number) => {
  await db.delete(botSubscriptions).where(eq(botSubscriptions.channelId, channelId))
}
