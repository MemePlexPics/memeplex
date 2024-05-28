import { eq, inArray } from 'drizzle-orm'
import { botTopicNames, botTopics } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotTopicByNames = async (db: TDbConnection, names: string[]) => {
  return await db
    .select({
      id: botTopicNames.id,
      name: botTopicNames.name,
      keywordId: botTopics.keywordId,
    })
    .from(botTopics)
    .leftJoin(botTopicNames, eq(botTopicNames.id, botTopics.nameId))
    .where(inArray(botTopicNames.name, names))
}
