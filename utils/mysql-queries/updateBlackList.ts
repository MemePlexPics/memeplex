import { wordsBlacklist } from '../../db/schema'
import type { TDbConnection } from '../types'

export const updateBlackList = async (
  db: TDbConnection,
  words: typeof wordsBlacklist.$inferInsert,
) => {
  // eslint-disable-next-line drizzle/enforce-update-with-where
  return await db.update(wordsBlacklist).set(words)
}
