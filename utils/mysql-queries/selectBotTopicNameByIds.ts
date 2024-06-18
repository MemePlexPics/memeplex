import { inArray } from 'drizzle-orm'
import { botTopicNames } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotTopicNameByIds = async (db: TDbConnection, topicIds: number[]) => {
  return await db.select().from(botTopicNames).where(inArray(botTopicNames.id, topicIds))
}
