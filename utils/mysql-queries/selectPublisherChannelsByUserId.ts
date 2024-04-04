import { botPublisherChannels } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherChannelsByUserId = async (db: TDbConnection, id: number) => {
  return await db.select().from(botPublisherChannels).where(eq(botPublisherChannels.userId, id))
}
