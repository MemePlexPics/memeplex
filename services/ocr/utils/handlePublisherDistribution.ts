import { fuseSearch, getDbConnection } from '../../../utils'
import { AMQP_PUBLISHER_DISTRIBUTION_CHANNEL } from '../../../constants'
import {
  getPublisherKeywords,
  selectPublisherGroupSubscriptionsByName,
  selectPublisherKeywordGroups,
  selectPublisherSubscriptionsByKeyword,
} from '../../../utils/mysql-queries'
import { Channel } from 'amqplib'
import {
  TMemeEntity,
  TPrePublisherDistributionQueue,
  TPublisherDistributionQueueMsg,
} from '../types'
import { getPublisherUserByChannelIdAndTariffPlan } from '../../utils'

export const handlePublisherDistribution = async (
  amqpChannel: Channel,
  document: TMemeEntity,
  memeId: string,
) => {
  const db = await getDbConnection()
  const keywords = await getPublisherKeywords(db)
  const keywordGroups = await selectPublisherKeywordGroups(db)
  const groupsByKeyword = keywordGroups.reduce<Record<string, string[]>>(
    (obj, { name, keywords }) => {
      keywords.split(', ').forEach(keyword => {
        if (!obj[keyword]) obj[keyword] = []
        obj[keyword].push(name)
      })
      return obj
    },
    {},
  )
  const allKeywords = new Set<string>()
  keywords.forEach(({ keyword }) => allKeywords.add(keyword))
  Object.keys(groupsByKeyword).forEach(keyword => allKeywords.add(keyword))

  const queue: TPrePublisherDistributionQueue = {}

  const keywordsByUser = {}
  const keywordGroupsByUser = {}
  const tariffPlanByUsers: Record<number, 'free' | 'premium'> = {}
  for (const keyword of allKeywords) {
    const results = fuseSearch([document.eng], keyword)
    if (!results.length) continue
    const subscriptions = await selectPublisherSubscriptionsByKeyword(db, keyword)
    const groupSubscriptions = groupsByKeyword[keyword]
      ? await selectPublisherGroupSubscriptionsByName(db, groupsByKeyword[keyword])
      : []
    for (const { channelId } of subscriptions) {
      const userId = await getPublisherUserByChannelIdAndTariffPlan(
        db,
        queue,
        tariffPlanByUsers,
        channelId,
        memeId,
        document,
      )
      if (tariffPlanByUsers[userId] === 'free') continue
      if (!keywordsByUser[userId]) {
        keywordsByUser[userId] = new Set<string>()
      }
      queue[userId].channelIds.push(channelId)
      keywordsByUser[userId].add(keyword)
    }

    for (const { groupName, channelId } of groupSubscriptions) {
      const userId = await getPublisherUserByChannelIdAndTariffPlan(
        db,
        queue,
        tariffPlanByUsers,
        channelId,
        memeId,
        document,
      )
      if (tariffPlanByUsers[userId] === 'premium') continue
      if (!keywordGroupsByUser[userId]) {
        keywordGroupsByUser[userId] = new Set<string>()
      }
      queue[userId].channelIds.push(channelId)
      keywordGroupsByUser[userId].add(groupName)
    }
  }
  await db.close()

  for (const userId in queue) {
    if (
      !queue[userId].channelIds.length ||
      (!keywordsByUser[userId]?.length && !keywordGroupsByUser[userId]?.length)
    )
      continue
    const buffer = Buffer.from(
      JSON.stringify({
        userId: Number(userId),
        ...queue[userId],
        keywords: keywordsByUser[userId] ? [...keywordsByUser[userId]] : [],
        keywordGroups: keywordGroupsByUser[userId] ? [...keywordGroupsByUser[userId]] : [],
      } as TPublisherDistributionQueueMsg),
    )
    amqpChannel.sendToQueue(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL, buffer, {
      persistent: true,
    })
  }
}
