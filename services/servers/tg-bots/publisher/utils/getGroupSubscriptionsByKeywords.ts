import { selectPublisherGroupSubscriptionsByName } from '../../../../../utils/mysql-queries'
import { TDbConnection } from '../../../../../utils/types'

export const getGroupSubscriptionsByKeywords = async (
  db: TDbConnection,
  keywords: string[],
  groupsByKeyword: Record<string, string[]>,
) => {
  const groupSubscriptionsByKeyword: Record<string, { groupName: string; channelId: number }[]> = {}

  for (const keyword of keywords) {
    if (groupsByKeyword[keyword]) {
      const groupSubscriptions = await selectPublisherGroupSubscriptionsByName(
        db,
        groupsByKeyword[keyword],
      )
      groupSubscriptionsByKeyword[keyword] = groupSubscriptions
    }
  }

  return groupSubscriptionsByKeyword
}
