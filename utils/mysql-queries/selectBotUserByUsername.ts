import { botUsers } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotUserByUsername = async (db: TDbConnection, username: `@${string}`) => {
  return await db.select().from(botUsers).where(eq(botUsers.user, username))
}
