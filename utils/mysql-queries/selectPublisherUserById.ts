import { MySql2Database } from 'drizzle-orm/mysql2'
import { botPublisherUsers } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const selectPublisherUserById = async (
  db: MySql2Database<Record<string, never>>,
  id: number
) => {
  return await db
    .select()
    .from(botPublisherUsers)
    .where(eq(botPublisherUsers.id, id))
}
