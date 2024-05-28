import { eq } from 'drizzle-orm'
import { botPublisherKeywordGroupNames, botPublisherKeywordGroups } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectPublisherKeywordGroups = async (db: TDbConnection) => {
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
}
