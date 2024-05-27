import { botPublisherChannels } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deletePublisherChannelById = async (db: TDbConnection, id: number) => {
  return await db.delete(botPublisherChannels).where(eq(botPublisherChannels.id, id))
}
