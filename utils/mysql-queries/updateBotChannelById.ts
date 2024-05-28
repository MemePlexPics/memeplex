import { eq } from 'drizzle-orm'
import { botChannels } from '../../db/schema'
import type { TDbConnection } from '../types'

export const updateBotChannelById = async (
  db: TDbConnection,
  values: Partial<Omit<typeof botChannels.$inferInsert, 'id' | 'timestamp'>>,
  id: number,
) => {
  await db.update(botChannels).set(values).where(eq(botChannels.id, id))
}
