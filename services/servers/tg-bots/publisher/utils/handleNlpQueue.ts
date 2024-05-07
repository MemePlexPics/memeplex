import amqplib, { Channel, Connection, GetMessage } from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { Logger } from 'winston'
import { getAmqpQueue, getPublisherUserByChannelIdAndTariffPlan } from '../../../../utils'
import {
  AMQP_NLP_TO_PUBLISHER_CHANNEL,
  AMQP_PUBLISHER_DISTRIBUTION_CHANNEL,
  EMPTY_QUEUE_RETRY_DELAY,
} from '../../../../../constants'
import { delay, getDbConnection } from '../../../../../utils'
import {
  selectPublisherGroupSubscriptionsByName,
  selectPublisherKeywordGroups,
  selectPublisherSubscriptionsByKeyword,
} from '../../../../../utils/mysql-queries'
import {
  TMemeEntity,
  TPrePublisherDistributionQueue,
  TPublisherDistributionQueueMsg,
} from '../../../../types'

export const handleNlpQueue = async (logger: Logger) => {
  let amqp: Connection,
    receiveNlpMessageCh: Channel,
    sendToPublisherDistributionCh: Channel,
    receiveNlpMessageClearTimeout: () => void

  try {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    sendToPublisherDistributionCh = await amqp.createChannel()
    let receiveNlpMessageTimeout: (ms: number, logger: Logger, msg: GetMessage) => void
    ;[receiveNlpMessageCh, receiveNlpMessageTimeout, receiveNlpMessageClearTimeout] =
      await getAmqpQueue(amqp, AMQP_NLP_TO_PUBLISHER_CHANNEL)
    const db = await getDbConnection()
    await db.close()
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

    for (;;) {
      const msg = await receiveNlpMessageCh.get(AMQP_NLP_TO_PUBLISHER_CHANNEL)
      if (!msg) {
        await delay(EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      receiveNlpMessageTimeout(600_000, logger, msg)
      const payload: {
        memeId: string
        memeData: TMemeEntity
        matchedKeywords: string[]
      } = JSON.parse(msg.content.toString())

      const queue: TPrePublisherDistributionQueue = {}

      const keywordsByUser: Record<number, Set<string>> = {}
      const keywordGroupsByUser: Record<number, Set<string>> = {}
      const tariffPlanByUsers: Record<number, 'free' | 'premium'> = {}
      for (const keyword of payload.matchedKeywords) {
        const db = await getDbConnection()
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
            payload.memeId,
            payload.memeData,
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
            payload.memeId,
            payload.memeData,
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
          (!keywordsByUser[userId]?.size && !keywordGroupsByUser[userId]?.size)
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
        sendToPublisherDistributionCh.sendToQueue(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL, buffer, {
          persistent: true,
        })
      }
    }
  } finally {
    receiveNlpMessageClearTimeout()
    if (receiveNlpMessageCh) await receiveNlpMessageCh.close()
    if (sendToPublisherDistributionCh) await sendToPublisherDistributionCh.close()
    if (amqp) await amqp.close()
  }
}
