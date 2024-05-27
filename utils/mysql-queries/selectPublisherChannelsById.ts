import { botPublisherChannels } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectPublisherChannelsById = async (db: TDbConnection, channelIds: number[]) => {
  return await db
    .select()
    .from(botPublisherChannels)
    .where(inArray(botPublisherChannels.id, channelIds))
}
