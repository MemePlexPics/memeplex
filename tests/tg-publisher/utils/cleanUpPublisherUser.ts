import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../../../utils/types'
import { botActions, botUsers, botUserLanguages, telegrafSessions } from '../../../db/schema'

export const cleanUpPublisherUser = async (db: TDbConnection, userId: number = 1) => {
  await db.delete(botActions).where(eq(botActions.userId, 1))
  await db.delete(telegrafSessions).where(eq(telegrafSessions.key, `${userId}:${userId}`))
  await db.delete(botUserLanguages).where(eq(botUserLanguages.userId, userId))
  await db.delete(botUsers).where(eq(botUsers.id, userId))
}
