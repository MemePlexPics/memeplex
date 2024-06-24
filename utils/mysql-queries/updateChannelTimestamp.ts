import { eq } from 'drizzle-orm'
import { channels } from '../../db/schema'
import type { TDbConnection } from '../types'

export async function updateChannelTimestamp(db: TDbConnection, name: string, timestamp: number) {
  await db
    .update(channels)
    .set({
      timestamp,
    })
    .where(eq(channels.name, name))
}
