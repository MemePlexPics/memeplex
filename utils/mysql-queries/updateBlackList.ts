import { wordsBlacklist } from '../../db/schema'
import { TDbConnection } from '../types'

export const updateBlackList = async (db: TDbConnection, words: typeof wordsBlacklist.$inferInsert) => {
  return await db.update(wordsBlacklist).set(words)
}
