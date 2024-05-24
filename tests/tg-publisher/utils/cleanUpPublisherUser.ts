import { sql } from 'drizzle-orm'
import { TDbConnection } from '../../../utils/types'

export const cleanUpPublisherUser = async (db: TDbConnection, userId: number = 1) => {
  await db.execute(sql`DELETE FROM telegraf_publisher_sessions WHERE \`key\` = '${userId}:1'`)
  await db.execute(sql`DELETE FROM bot_publisher_users WHERE id = ${userId}`)
}
