import { botUsers } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectAllBotUsers = async (db: TDbConnection) => {
  return await db.select().from(botUsers);
}
