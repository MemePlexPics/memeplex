import { eq } from 'drizzle-orm'
import { featuredChannels } from '../../db/schema'
import type { TDbConnection } from '../types'

export const removeFeaturedChannel = async (db: TDbConnection, name: string) => {
  await db.delete(featuredChannels).where(eq(featuredChannels.username, name))
}
