import { eq } from 'drizzle-orm'
import { channels } from '../../db/schema'
import { TDbConnection } from '../types'

type TChannel = Pick<typeof channels.$inferInsert, 'name' | 'availability'> &
Partial<Pick<typeof channels.$inferInsert, 'withText'>>

export const updateChannelAvailability = async (db: TDbConnection, channel: TChannel) => {
  const value: Omit<TChannel, 'name'> = {
    availability: channel.availability,
  }
  if (channel.withText !== undefined) {
    value.withText = channel.withText
  }
  return await db.update(channels).set(value).where(eq(channels.name, channel.name))
}
