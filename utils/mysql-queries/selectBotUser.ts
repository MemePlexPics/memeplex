import { eq } from 'drizzle-orm'
import { botUsers } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotUser = async (db: TDbConnection, id: number) => {
  const [response] = await db
    .select({
      id: botUsers.id,
    })
    .from(botUsers)
    .where(eq(botUsers.id, id))
  return response
}
