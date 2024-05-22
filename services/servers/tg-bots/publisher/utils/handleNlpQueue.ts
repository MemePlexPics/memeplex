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
  selectPublisherGroupKeywordUnsubscriptions,
  selectPublisherKeywordGroupWithKeywords,
  selectPublisherSubscriptionsByKeywords,
} from '../../../../../utils/mysql-queries'
import {
  TAmqpNLPToPublisherChannelMessage,
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
    const keywordGroups = await selectPublisherKeywordGroupWithKeywords(db)
    await db.close()
    const groupIdsByKeyword = keywordGroups.reduce<Record<string, number[]>>(
      (obj, { groupId, keyword }) => {
        if (!keyword) return obj
        if (!obj[keyword]) obj[keyword] = []
        obj[keyword]!.push(groupId)
        return obj
      },
      {},
    )

    for (;;) {
      const msg = await receiveNlpMessageCh.get(AMQP_NLP_TO_PUBLISHER_CHANNEL)
      if (!msg) {
        await delay(process.env.ENVIRONMENT === 'TESTING' ? 100 : EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      receiveNlpMessageTimeout(600_000, logger, msg)
      const payload: TAmqpNLPToPublisherChannelMessage = JSON.parse(msg.content.toString())

      const queue: TPrePublisherDistributionQueue = {}

      // TODO: improve readability
      const keywordsByUser: Record<number, Set<string>> = {}
      const keywordGroupIdsByUser: Record<number, Set<number>> = {}
      const groupKeywordIdsByUser: Record<number, Record<string, number>> = {}
      const channelIdsByKeyword: Record<number, Record<string, Set<number>>> = {}
      const channelIdsByKeywordGroup: Record<number, Record<string, Set<number>>> = {}
      const tariffPlanByUsers: Record<number, 'free' | 'premium'> = {}
      const db = await getDbConnection()
      const { channelIds, groupSubscriptionsByKeyword } = await getGroupSubscriptionsByKeywords(
        db,
        payload.matchedKeywords,
        groupIdsByKeyword,
      )
      const subscriptions =
        payload.matchedKeywords.length !== 0
          ? await selectPublisherSubscriptionsByKeywords(db, payload.matchedKeywords)
          : []
      const unsubscriptions =
        channelIds.size !== 0 && payload.matchedKeywords.length !== 0
          ? await selectPublisherGroupKeywordUnsubscriptions(
            db,
            [...channelIds],
            payload.matchedKeywords,
          )
          : []
      const unsubscriptionKeywordsByChannelId = unsubscriptions.reduce<
      Record<string, Record<number, true>>
      >((obj, { channelId, keyword }) => {
        if (!keyword) {
          return obj
        }
        if (!obj[keyword]) {
          obj[keyword] = {}
        }
        obj[keyword][channelId] = true
        return obj
      }, {})
      for (const keyword of payload.matchedKeywords) {
        const groupSubscriptions = groupSubscriptionsByKeyword[keyword] ?? []

        for (const { groupId, channelId } of groupSubscriptions) {
          const userId = await getPublisherUserByChannelIdAndTariffPlan(
            db,
            queue,
            tariffPlanByUsers,
            channelId,
            payload.memeId,
            payload.memeData,
          )
          if (
            tariffPlanByUsers[userId] === 'premium' &&
            unsubscriptionKeywordsByChannelId[keyword] &&
            unsubscriptionKeywordsByChannelId[keyword][channelId]
          ) {
            continue
          }
          if (!keywordGroupIdsByUser[userId]) {
            keywordGroupIdsByUser[userId] = new Set<number>()
          }
          keywordGroupIdsByUser[userId].add(groupId)

          if (!channelIdsByKeywordGroup[userId]) {
            channelIdsByKeywordGroup[userId] = {}
          }
          if (!channelIdsByKeywordGroup[userId][groupId]) {
            channelIdsByKeywordGroup[userId][groupId] = new Set<number>()
          }
          channelIdsByKeywordGroup[userId][groupId].add(channelId)

          if (!channelIdsByKeyword[userId]) {
            channelIdsByKeyword[userId] = {}
          }
          if (!channelIdsByKeyword[userId][keyword]) {
            channelIdsByKeyword[userId][keyword] = new Set<number>()
          }
          channelIdsByKeyword[userId][keyword].add(channelId)

          queue[userId].channelIds.push(channelId)
          if (!groupKeywordIdsByUser[userId]) {
            groupKeywordIdsByUser[userId] = {}
          }
          groupKeywordIdsByUser[userId][keyword] = groupId
        }
      }

      for (const { channelId, keyword } of subscriptions) {
        if (!keyword) {
          continue
        }
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
          (groupKeywordIdsByUser[userId] && keyword in groupKeywordIdsByUser[userId])
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
      await db.close()

      for (const userId in queue) {
        if (
          !queue[userId].channelIds.length ||
          (keywordsByUser[userId]?.size === 0 && keywordGroupIdsByUser[userId]?.size === 0)
        )
          continue

        const content: TPublisherDistributionQueueMsg = {
          userId: Number(userId),
          ...queue[userId],
          keywords: keywordsByUser[userId] ? [...keywordsByUser[userId]] : [],
          keywordGroupIds: keywordGroupIdsByUser[userId] ? [...keywordGroupIdsByUser[userId]] : [],
          groupKeywords: groupKeywordIdsByUser[userId] ?? {},
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
        }
        const buffer = Buffer.from(JSON.stringify(content))
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
