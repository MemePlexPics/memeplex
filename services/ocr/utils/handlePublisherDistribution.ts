import { fuseSearch, getDbConnection } from '../../../utils'
import { AMQP_PUBLISHER_DISTRIBUTION_CHANNEL } from '../../../constants'
import {
  getPublisherKeywords,
  selectPublisherChannelById,
  selectPublisherSubscriptionsByKeyword,
  selectPublisherUserById,
} from '../../../utils/mysql-queries'
import { Channel } from 'amqplib'
import { TMemeEntity, TPublisherDistributionQueueMsg } from '../types'

export const handlePublisherDistribution = async (
  amqpChannel: Channel,
  document: TMemeEntity,
  memeId: string,
) => {
  const db = await getDbConnection()
  const keywords = await getPublisherKeywords(db)

  const queue: Record<number, Omit<TPublisherDistributionQueueMsg, 'userId'>> = {}

  const keywordsByUser = {}
  for (const { keyword } of keywords) {
    const results = fuseSearch([document.eng], keyword)
    if (!results.length) continue
    const subscriptions = await selectPublisherSubscriptionsByKeyword(db, keyword)
    for (const { channelId } of subscriptions) {
      const [channel] = await selectPublisherChannelById(db, channelId)
      const [user] = await selectPublisherUserById(db, channel.userId)
      const userId = user.id
      if (!keywordsByUser[userId]) {
        keywordsByUser[userId] = new Set<string>()
      }
      if (!queue[userId])
        queue[userId] = {
          memeId,
          document: {
            fileName: document.fileName,
            channelName: document.channelName,
            messageId: document.messageId,
          },
          keywords: [],
          channelIds: [],
        }
      queue[userId].channelIds.push(channelId)
      keywordsByUser[userId].add(keyword)
    }
  }
  await db.close()

  for (const userId in queue) {
    const buffer = Buffer.from(
      JSON.stringify({
        userId,
        ...queue[userId],
        keywords: [...keywordsByUser[userId]],
      }),
    )
    amqpChannel.sendToQueue(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL, buffer, {
      persistent: true,
    })
  }
}
