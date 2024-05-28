import { eq } from 'drizzle-orm'
import { featuredChannels } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectFeaturedChannelByUsername = async (db: TDbConnection, username: string) => {
  return await db.select().from(featuredChannels).where(eq(featuredChannels.username, username))
}
