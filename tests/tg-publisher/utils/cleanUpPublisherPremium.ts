import { eq } from 'drizzle-orm'
import { botUserPremiums } from '../../../db/schema'
import type { TDbConnection } from '../../../utils/types'

export const cleanUpPublisherPremium = async (db: TDbConnection, userId: number = 1) => {
  await db.delete(botUserPremiums).where(eq(botUserPremiums.userId, userId))
}
