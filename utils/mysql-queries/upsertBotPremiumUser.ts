import { botUserPremiums } from '../../db/schema'
import type { TDbConnection } from '../types'

export const upsertBotPremiumUser = async (
  db: TDbConnection,
  values: typeof botUserPremiums.$inferInsert,
) => {
  return await db
    .insert(botUserPremiums)
    .values(values)
    .onDuplicateKeyUpdate({ set: { untilTimestamp: values.untilTimestamp } })
}
