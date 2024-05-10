import { botPublisherUserPremiums } from '../../db/schema'
import { TDbConnection } from '../types'

export const insertPublisherPremiumUser = async (
  db: TDbConnection,
  id: number,
  untilTimestamp: number,
) => {
  return await db
    .insert(botPublisherUserPremiums)
    .values({
      userId: id,
      untilTimestamp,
    })
    .onDuplicateKeyUpdate({ set: { untilTimestamp } })
}
