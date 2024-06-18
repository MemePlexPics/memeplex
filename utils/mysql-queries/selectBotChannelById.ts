import { botChannels } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotChannelById = async (db: TDbConnection, id: number) => {
  return await db.select().from(botChannels).where(eq(botChannels.id, id))
}
