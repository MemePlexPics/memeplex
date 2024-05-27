import { botPublisherGroupSubscriptions } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const selectPublisherGroupSubscriptionsByGroupIds = async (
  db: TDbConnection,
  groupIds: number[],
) => {
  return await db
    .select()
    .from(botPublisherGroupSubscriptions)
    .where(inArray(botPublisherGroupSubscriptions.groupId, groupIds))
}
