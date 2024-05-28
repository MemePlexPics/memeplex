import { inArray } from 'drizzle-orm'
import { botTopics } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotTopicByIds = async (db: TDbConnection, topicIds: number[]) => {
  return await db.select().from(botTopics).where(inArray(botTopics.id, topicIds))
}
