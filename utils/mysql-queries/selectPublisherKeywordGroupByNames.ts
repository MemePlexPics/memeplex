import { eq, inArray } from 'drizzle-orm'
import { botPublisherKeywordGroupNames, botPublisherKeywordGroups } from '../../db/schema'
import { TDbConnection } from '../types'

export const selectPublisherKeywordGroupByNames = async (db: TDbConnection, names: string[]) => {
  return await db
    .select({
      id: botPublisherKeywordGroupNames.id,
      name: botPublisherKeywordGroupNames.name,
      keywordId: botPublisherKeywordGroups.keywordId,
    })
    .from(botPublisherKeywordGroups)
    .leftJoin(
      botPublisherKeywordGroupNames,
      eq(botPublisherKeywordGroupNames.id, botPublisherKeywordGroups.groupId),
    )
    .where(inArray(botPublisherKeywordGroupNames.name, names))
}
