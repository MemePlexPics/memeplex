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
  selectPublisherKeywordGroups,
  selectPublisherSubscriptionsByKeyword,
} from '../../../../../utils/mysql-queries'
import {
  TMemeEntity,
  TPrePublisherDistributionQueue,
  TPublisherDistributionQueueMsg,
} from '../../../../types'
import { getGroupSubscriptionsByKeywords } from '.'

export const handleNlpQueue = async (logger: Logger) => {
  let amqp: Connection | undefined,
    receiveNlpMessageCh: Channel | undefined,
    sendToPublisherDistributionCh: Channel | undefined,
    receiveNlpMessageClearTimeout: (() => void) | undefined

  try {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    sendToPublisherDistributionCh = await amqp.createChannel()
    let receiveNlpMessageTimeout: (ms: number, logger: Logger, msg: GetMessage) => void
    ;[receiveNlpMessageCh, receiveNlpMessageTimeout, receiveNlpMessageClearTimeout] =
      await getAmqpQueue(amqp, AMQP_NLP_TO_PUBLISHER_CHANNEL)
    const db = await getDbConnection()
    const keywordGroups = await selectPublisherKeywordGroups(db)
    await db.close()
    const groupsByKeyword = keywordGroups.reduce<Record<string, string[]>>(
      (obj, { name, keywords }) => {
        keywords.split(', ').forEach(keyword => {
          if (!obj[keyword]) obj[keyword] = []
          obj[keyword]!.push(name)
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
      const groupKeywordsByUser: Record<number, Record<string, string>> = {}
      const channelIdsByKeyword: Record<number, Record<string, Set<number>>> = {}
      const channelIdsByKeywordGroup: Record<number, Record<string, Set<number>>> = {}
      const tariffPlanByUsers: Record<number, 'free' | 'premium'> = {}
      const db = await getDbConnection()
      const groupSubscriptionsByKeyword = await getGroupSubscriptionsByKeywords(
        db,
        payload.matchedKeywords,
        groupsByKeyword,
      )
      for (const keyword of payload.matchedKeywords) {
        const subscriptions = await selectPublisherSubscriptionsByKeyword(db, keyword)
        const groupSubscriptions = groupSubscriptionsByKeyword[keyword] ?? []

        for (const { groupName, channelId } of groupSubscriptions) {
          const userId = await getPublisherUserByChannelIdAndTariffPlan(
            db,
            queue,
            tariffPlanByUsers,
            channelId,
            payload.memeId,
            payload.memeData,
          )
          if (!keywordGroupsByUser[userId]) {
            keywordGroupsByUser[userId] = new Set<string>()
          }
          keywordGroupsByUser[userId].add(groupName)

          if (!channelIdsByKeywordGroup[userId]) {
            channelIdsByKeywordGroup[userId] = {}
          }
          if (!channelIdsByKeywordGroup[userId][groupName]) {
            channelIdsByKeywordGroup[userId][groupName] = new Set<number>()
          }
          channelIdsByKeywordGroup[userId][groupName].add(channelId)

          if (!channelIdsByKeyword[userId]) {
            channelIdsByKeyword[userId] = {}
          }
          if (!channelIdsByKeyword[userId][keyword]) {
            channelIdsByKeyword[userId][keyword] = new Set<number>()
          }
          channelIdsByKeyword[userId][keyword].add(channelId)

          queue[userId].channelIds.push(channelId)
          if (!groupKeywordsByUser[userId]) {
            groupKeywordsByUser[userId] = {}
          }
          groupKeywordsByUser[userId][keyword] = groupName
        }

        for (const { channelId } of subscriptions) {
          const userId = await getPublisherUserByChannelIdAndTariffPlan(
            db,
            queue,
            tariffPlanByUsers,
            channelId,
            payload.memeId,
            payload.memeData,
          )
          if (
            tariffPlanByUsers[userId] === 'free' ||
            (groupKeywordsByUser[userId] && keyword in groupKeywordsByUser[userId])
          )
            continue

          if (!channelIdsByKeyword[userId]) {
            channelIdsByKeyword[userId] = {}
          }
          if (!channelIdsByKeyword[userId][keyword]) {
            channelIdsByKeyword[userId][keyword] = new Set<number>()
          }
          channelIdsByKeyword[userId][keyword].add(channelId)

          if (!keywordsByUser[userId]) {
            keywordsByUser[userId] = new Set<string>()
          }
          queue[userId].channelIds.push(channelId)
          keywordsByUser[userId].add(keyword)
        }
      }
      await db.close()

      for (const userId in queue) {
        if (
          !queue[userId].channelIds.length ||
          (keywordsByUser[userId]?.size === 0 && keywordGroupsByUser[userId]?.size === 0)
        )
          continue
        const buffer = Buffer.from(
          JSON.stringify({
            userId: Number(userId),
            ...queue[userId],
            keywords: keywordsByUser[userId] ? [...keywordsByUser[userId]] : [],
            keywordGroups: keywordGroupsByUser[userId] ? [...keywordGroupsByUser[userId]] : [],
            groupKeywords: groupKeywordsByUser[userId] ?? {},
            channelIdsByKeyword: channelIdsByKeyword[userId]
              ? Object.entries(channelIdsByKeyword[userId]).reduce<Record<string, number[]>>(
                (acc, [keyword, channelIds]) => {
                  acc[keyword] = [...channelIds]
                  return acc
                },
                {},
              )
              : {},
            channelIdsByKeywordGroup: channelIdsByKeywordGroup[userId]
              ? Object.entries(channelIdsByKeywordGroup[userId]).reduce<Record<string, number[]>>(
                (acc, [keywordGroup, channelIds]) => {
                  acc[keywordGroup] = [...channelIds]
                  return acc
                },
                {},
              )
              : {},
          } as TPublisherDistributionQueueMsg),
        )
        sendToPublisherDistributionCh.sendToQueue(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL, buffer, {
          persistent: true,
        })
      }
      receiveNlpMessageCh.ack(msg)
    }
  } finally {
    receiveNlpMessageClearTimeout?.()
    if (receiveNlpMessageCh) await receiveNlpMessageCh.close()
    if (sendToPublisherDistributionCh) await sendToPublisherDistributionCh.close()
    if (amqp) await amqp.close()
  }
}
