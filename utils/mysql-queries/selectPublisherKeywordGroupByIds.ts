import { inArray } from 'drizzle-orm'
import { botPublisherKeywordGroups } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectPublisherKeywordGroupByIds = async (db: TDbConnection, groupIds: number[]) => {
  return await db
    .select()
    .from(botPublisherKeywordGroups)
    .where(inArray(botPublisherKeywordGroups.id, groupIds))
}
