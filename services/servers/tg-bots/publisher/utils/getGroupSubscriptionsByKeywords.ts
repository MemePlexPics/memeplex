import type { botPublisherGroupSubscriptions } from '../../../../../db/schema'
import { selectPublisherGroupSubscriptionsByGroupIds } from '../../../../../utils/mysql-queries'
import type { TDbConnection } from '../../../../../utils/types'

export const getGroupSubscriptionsByKeywords = async (
  db: TDbConnection,
  keywords: string[],
  groupIdsByKeyword: Record<string, number[]>,
) => {
  const groupSubscriptionsByKeyword: Record<
  string,
  (typeof botPublisherGroupSubscriptions.$inferSelect)[]
  > = {}
  const channelIds = new Set<number>()

  for (const keyword of keywords) {
    if (groupIdsByKeyword[keyword]) {
      const groupSubscriptions = await selectPublisherGroupSubscriptionsByGroupIds(
        db,
        groupIdsByKeyword[keyword],
      )
      groupSubscriptionsByKeyword[keyword] = groupSubscriptions
      groupSubscriptions.forEach(groupSubscription => channelIds.add(groupSubscription.channelId))
    }
  }

  return {
    channelIds,
    groupSubscriptionsByKeyword,
  }
}
