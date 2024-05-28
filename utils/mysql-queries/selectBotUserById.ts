import { botUsers } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotUserById = async (db: TDbConnection, id: number) => {
  return await db.select().from(botUsers).where(eq(botUsers.id, id))
}
