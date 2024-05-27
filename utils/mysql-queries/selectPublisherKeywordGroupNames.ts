import { botPublisherKeywordGroupNames } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectPublisherKeywordGroupNames = async (db: TDbConnection) => {
  return await db.select().from(botPublisherKeywordGroupNames)
}
