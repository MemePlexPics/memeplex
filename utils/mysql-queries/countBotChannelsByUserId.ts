import { botChannels } from '../../db/schema'
import { count, eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const countBotChannelsByUserId = async (db: TDbConnection, userId: number) => {
  const [response] = await db
    .select({ values: count() })
    .from(botChannels)
    .where(eq(botChannels.userId, userId))
  return response.values
}
