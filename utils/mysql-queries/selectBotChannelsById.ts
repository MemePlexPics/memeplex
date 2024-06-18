import { botChannels } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotChannelsById = async (db: TDbConnection, channelIds: number[]) => {
  return await db.select().from(botChannels).where(inArray(botChannels.id, channelIds))
}
