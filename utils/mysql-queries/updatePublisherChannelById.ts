import { eq } from 'drizzle-orm'
import { botPublisherChannels } from '../../db/schema'
import { TDbConnection } from '../types'

export const updatePublisherChannelById = async (
  db: TDbConnection,
  values: Partial<Omit<typeof botPublisherChannels.$inferInsert, 'id' | 'timestamp'>>,
  id: number,
) => {
  await db.update(botPublisherChannels).set(values).where(eq(botPublisherChannels.id, id))
}
