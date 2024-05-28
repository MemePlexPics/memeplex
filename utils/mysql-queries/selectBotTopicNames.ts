import { botTopicNames } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectBotTopicNames = async (db: TDbConnection) => {
  return await db.select().from(botTopicNames)
}
