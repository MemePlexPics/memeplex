import { eq } from 'drizzle-orm'
import { channels } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectAvailableChannels = async (db: TDbConnection) => {
  return await db.select().from(channels).where(eq(channels.availability, 1))
}
