import { eq, sql } from 'drizzle-orm'
import type { TDbConnection } from '../../../utils/types'
import { botUsers } from '../../../db/schema'

export const cleanUpPublisherUser = async (db: TDbConnection, userId: number = 1) => {
  await db.execute(sql`DELETE FROM telegraf_sessions WHERE \`key\` = '${userId}:1'`)
  await db.delete(botUsers).where(eq(botUsers.id, userId))
}
