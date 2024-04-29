import { botPublisherGroupSubscriptions } from '../../db/schema'
import { inArray } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const selectPublisherGroupSubscriptionsByName = async (
  db: TDbConnection,
  names: string[],
) => {
  return await db
    .select()
    .from(botPublisherGroupSubscriptions)
    .where(inArray(botPublisherGroupSubscriptions.groupName, names))
}
