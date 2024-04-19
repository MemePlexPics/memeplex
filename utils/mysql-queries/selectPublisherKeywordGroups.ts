import { botPublisherKeywordGroups } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectPublisherKeywordGroups = async (db: TDbConnection) => {
  return await db.select().from(botPublisherKeywordGroups)
}
