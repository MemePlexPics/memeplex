import { getDbConnection } from '../../../utils'
import { AMQP_PUBLISHER_DISTRIBUTION_CHANNEL, fuseOptions } from '../../../constants'
import {
  getPublisherKeywords,
  selectPublisherChannelById,
  selectPublisherSubscriptionsByKeyword,
  selectPublisherUserById,
} from '../../../utils/mysql-queries'
import { Channel } from 'amqplib'
import { TMemeEntity, TPublisherDistributionQueueMsg } from '../types'
import Fuse from 'fuse.js'

export const handlePublisherDistribution = async (
  amqpChannel: Channel,
  document: TMemeEntity,
  memeId: string,
) => {
  const db = await getDbConnection()
  const keywords = await getPublisherKeywords(db)

  const queue: Record<number, Omit<TPublisherDistributionQueueMsg, 'userId'>> = {}

  let userId: number
  const fuse = new Fuse([document.eng], fuseOptions)
  for (const { keyword } of keywords) {
    const results = fuse.search(keyword)
    if (!results.length) continue
    const subscriptions = await selectPublisherSubscriptionsByKeyword(db, keyword)
    for (const { channelId } of subscriptions) {
      const [channel] = await selectPublisherChannelById(db, channelId)
      const [user] = await selectPublisherUserById(db, channel.userId)
      userId = user.id
      if (!queue[userId])
        queue[userId] = {
          memeId,
          document: {
            fileName: document.fileName,
          },
          keywords: [],
          channelIds: [],
        }
      queue[userId].channelIds.push(channelId)
      queue[userId].keywords.push(keyword)
    }
  }
  await db.close()

  for (const userId in queue) {
    const buffer = Buffer.from(
      JSON.stringify({
        userId,
        ...queue[userId],
      }),
    )
    amqpChannel.sendToQueue(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL, buffer, {
      persistent: true,
    })
  }
}
