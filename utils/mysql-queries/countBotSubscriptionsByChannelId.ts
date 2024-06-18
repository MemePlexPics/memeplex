import { botSubscriptions } from '../../db/schema'
import { count, eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const countBotSubscriptionsByChannelId = async (db: TDbConnection, channelId: number) => {
  const [response] = await db
    .select({ value: count() })
    .from(botSubscriptions)
    .where(eq(botSubscriptions.channelId, channelId))
  return response.value
}
