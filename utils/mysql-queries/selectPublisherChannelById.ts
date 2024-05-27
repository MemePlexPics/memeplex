import { botPublisherChannels } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectPublisherChannelById = async (db: TDbConnection, id: number) => {
  return await db.select().from(botPublisherChannels).where(eq(botPublisherChannels.id, id))
}
