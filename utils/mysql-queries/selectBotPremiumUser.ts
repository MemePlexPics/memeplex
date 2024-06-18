import { botUserPremiums } from '../../db/schema'
import { and, eq, gte } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotPremiumUser = async (db: TDbConnection, id: number) => {
  return await db
    .select()
    .from(botUserPremiums)
    .where(
      and(eq(botUserPremiums.userId, id), gte(botUserPremiums.untilTimestamp, Date.now() / 1000)),
    )
}
