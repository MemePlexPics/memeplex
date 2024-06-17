import { isNull } from 'drizzle-orm'
import { channels } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectAvailableChannels = async (db: TDbConnection) => {
  return await db.select().from(channels).where(isNull(channels.status))
}
