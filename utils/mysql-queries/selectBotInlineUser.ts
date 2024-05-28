import { eq } from 'drizzle-orm'
import { botInlineUsers } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotInlineUser = async (db: TDbConnection, id: number) => {
  const [response] = await db
    .select({ id: botInlineUsers.id })
    .from(botInlineUsers)
    .where(eq(botInlineUsers.id, id))
  return response
}
