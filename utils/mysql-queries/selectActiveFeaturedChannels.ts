import { sql } from 'drizzle-orm'
import { featuredChannels } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectActiveFeaturedChannels = async (db: TDbConnection) => {
  return await db
    .select({
      username: featuredChannels.username,
      title: featuredChannels.title,
    })
    .from(featuredChannels)
    .where(sql`${featuredChannels.timestamp} >= UNIX_TIMESTAMP(DATE_SUB(NOW(), INTERVAL 1 MONTH))`)
}
