import { botUserPremiums } from '../../db/schema'
import { eq } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const deleteBotPremiumUser = async (db: TDbConnection, userId: number) => {
  return await db.delete(botUserPremiums).where(eq(botUserPremiums.userId, userId))
}
