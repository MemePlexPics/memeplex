import { channels } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectChannel = async (db: TDbConnection, name: string) => {
  const results = await db.select().from(channels).where(eq(channels.name, name))
  return results.length ? results[0] : undefined
}
