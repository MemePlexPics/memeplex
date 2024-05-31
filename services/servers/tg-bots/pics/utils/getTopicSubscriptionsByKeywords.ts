import type { botTopicSubscriptions } from '../../../../../db/schema'
import { selectBotTopicSubscriptionsByTopicIds } from '../../../../../utils/mysql-queries'
import type { TDbConnection } from '../../../../../utils/types'

export const getTopicSubscriptionsByKeywords = async (
  db: TDbConnection,
  keywords: string[],
  topicIdsByKeyword: Record<string, number[]>,
) => {
  const topicSubscriptionsByKeyword: Record<string, (typeof botTopicSubscriptions.$inferSelect)[]> =
    {}
  const channelIds = new Set<number>()

  for (const keyword of keywords) {
    if (topicIdsByKeyword[keyword]) {
      const topicSubscriptions = await selectBotTopicSubscriptionsByTopicIds(
        db,
        topicIdsByKeyword[keyword],
      )
      topicSubscriptionsByKeyword[keyword] = topicSubscriptions
      topicSubscriptions.forEach(topicSubscription => channelIds.add(topicSubscription.channelId))
    }
  }

  return {
    channelIds,
    topicSubscriptionsByKeyword,
  }
}
