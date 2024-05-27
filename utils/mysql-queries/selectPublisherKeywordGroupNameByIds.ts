import { inArray } from 'drizzle-orm'
import { botPublisherKeywordGroupNames } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectPublisherKeywordGroupNameByIds = async (
  db: TDbConnection,
  groupIds: number[],
) => {
  return await db
    .select()
    .from(botPublisherKeywordGroupNames)
    .where(inArray(botPublisherKeywordGroupNames.id, groupIds))
}
