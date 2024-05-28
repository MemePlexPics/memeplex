import { eq } from 'drizzle-orm'
import { botTopicNames, botTopics } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotTopics = async (db: TDbConnection) => {
  return await db
    .select({
      id: botTopics.nameId,
      name: botTopicNames.name,
    })
    .from(botTopics)
    .leftJoin(botTopicNames, eq(botTopicNames.id, botTopics.nameId))
}
