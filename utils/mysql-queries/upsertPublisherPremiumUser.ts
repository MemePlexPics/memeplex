import { botPublisherUserPremiums } from '../../db/schema'
import { TDbConnection } from '../types'

export const upsertPublisherPremiumUser = async (
  db: TDbConnection,
  values: typeof botPublisherUserPremiums.$inferInsert,
) => {
  return await db
    .insert(botPublisherUserPremiums)
    .values(values)
    .onDuplicateKeyUpdate({ set: { untilTimestamp: values.untilTimestamp } })
}
