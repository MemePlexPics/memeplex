import { botPublisherUsers } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherUserById = async (db: TDbConnection, id: number) => {
  return await db.select().from(botPublisherUsers).where(eq(botPublisherUsers.id, id))
}
