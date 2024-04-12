import { wordsBlacklist } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectBlackList = async (db: TDbConnection) => {
  return await db.select().from(wordsBlacklist)
}
