import { botChannels } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deleteBotChannelById = async (db: TDbConnection, id: number) => {
  return await db.delete(botChannels).where(eq(botChannels.id, id))
}
