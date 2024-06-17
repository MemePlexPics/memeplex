import { eq } from 'drizzle-orm'
import { channels } from '../../db/schema'
import type { TDbConnection } from '../types'

type TChannel = Pick<typeof channels.$inferInsert, 'name' | 'status'> &
Partial<Pick<typeof channels.$inferInsert, 'withText'>>

export const updateChannelAvailability = async (db: TDbConnection, channel: TChannel) => {
  const value: Omit<TChannel, 'name'> = {
    status: channel.status,
  }
  if (channel.withText !== undefined) {
    value.withText = channel.withText
  }
  return await db.update(channels).set(value).where(eq(channels.name, channel.name))
}
