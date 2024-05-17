import { eq, inArray } from 'drizzle-orm'
import { botPublisherKeywordGroupNames, botPublisherKeywordGroups } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectPublisherKeywordGroupsByGroupIds = async (
  db: TDbConnection,
  groupIds: number[],
) => {
  return await db
    .select({
      id: botPublisherKeywordGroups.groupId,
      name: botPublisherKeywordGroupNames.name,
    })
    .from(botPublisherKeywordGroups)
    .leftJoin(
      botPublisherKeywordGroupNames,
      eq(botPublisherKeywordGroupNames.id, botPublisherKeywordGroups.groupId),
    )
    .where(inArray(botPublisherKeywordGroups.groupId, groupIds))
}
