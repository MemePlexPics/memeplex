import { channels } from '../../db/schema'
import { TDbConnection } from '../types'

export const insertChannel = async (db: TDbConnection, values: typeof channels.$inferInsert) => {
  return await db.insert(channels).values(values)
}
