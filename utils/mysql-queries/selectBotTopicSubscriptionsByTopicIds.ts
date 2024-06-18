import { botTopicSubscriptions } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectBotTopicSubscriptionsByTopicIds = async (
  db: TDbConnection,
  topicIds: number[],
) => {
  return await db
    .select()
    .from(botTopicSubscriptions)
    .where(inArray(botTopicSubscriptions.topicId, topicIds))
}
