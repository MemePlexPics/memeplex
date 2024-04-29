import { botPublisherUserPremiums } from '../../db/schema'
import { and, eq, lte } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherPremiumUser = async (db: TDbConnection, id: number) => {
  return await db
    .select()
    .from(botPublisherUserPremiums)
    .where(
      and(
        eq(botPublisherUserPremiums.userId, id),
        lte(botPublisherUserPremiums.untilTimestamp, Date.now() / 1000),
      ),
    )
}
