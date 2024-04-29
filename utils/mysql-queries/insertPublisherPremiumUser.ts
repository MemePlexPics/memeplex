import { botPublisherUserPremiums } from '../../db/schema'
import { TDbConnection } from '../types'

export const insertPublisherPremiumUser = async (db: TDbConnection, id: number) => {
  const untilTimestamp = Date.now() / 1000 + 60 * 60 * 24 * 31
  return await db
    .insert(botPublisherUserPremiums)
    .values({
      userId: id,
      untilTimestamp,
    })
    .onDuplicateKeyUpdate({ set: { untilTimestamp } })
}
