import { getDbConnection } from '../../../utils'
import { AMQP_PUBLISHER_DISTRIBUTION_CHANNEL } from '../../../constants'
import {
  getPublisherKeywords,
  selectPublisherChannelById,
  selectPublisherSubscriptionsByKeyword,
  selectPublisherUserById
} from '../../../utils/mysql-queries'
import { Channel } from 'amqplib'
import { TMemeEntity, TPublisherDistributionQueueMsg } from '../types'

export const handlePublisherDistribution = async (
  amqpChannel: Channel,
  document: TMemeEntity,
  memeId: string
) => {
  const db = await getDbConnection()
  const keywords = await getPublisherKeywords(db)

  const queue: Record<
  number,
  Omit<TPublisherDistributionQueueMsg, 'userId'>
  > = {}

  let userId: number
  for (const { keyword } of keywords) {
    // if (!document.eng.toLowerCase().includes(keyword)) return
    const subscriptions = await selectPublisherSubscriptionsByKeyword(
      db,
      keyword
    )
    for (const { channelId } of subscriptions) {
      const [channel] = await selectPublisherChannelById(db, channelId)
      const [user] = await selectPublisherUserById(db, channel.userId)
      userId = user.id
      if (!queue[userId])
        queue[userId] = {
          memeId,
          document,
          keywords: [],
          channelIds: []
        }
      queue[userId].channelIds.push(channelId)
      queue[userId].keywords.push(keyword)
    }
  }
  db.close()

  for (const userId in queue) {
    const buffer = Buffer.from(
      JSON.stringify({
        userId,
        ...queue[userId]
      })
    )
    amqpChannel.sendToQueue(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL, buffer, {
      persistent: true
    })
  }
}
