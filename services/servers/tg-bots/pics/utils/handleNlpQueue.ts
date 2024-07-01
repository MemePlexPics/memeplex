import type { Channel, Connection, GetMessage } from 'amqplib'
import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import type { Logger } from 'winston'
import { getAmqpQueue, getPublisherUserByChannelIdAndTariffPlan } from '../../../../utils'
import {
  AMQP_NLP_TO_PUBLISHER_CHANNEL,
  AMQP_PUBLISHER_DISTRIBUTION_CHANNEL,
  EMPTY_QUEUE_RETRY_DELAY,
} from '../../../../../constants'
import { delay, getDbConnection } from '../../../../../utils'
import {
  selectBotTopicKeywordUnsubscriptions,
  selectBotTopicWithKeywords,
  selectBotSubscriptionsByKeywords,
} from '../../../../../utils/mysql-queries'
import type {
  TAmqpNLPToPublisherChannelMessage,
  TPrePublisherDistributionQueue,
  TPublisherDistributionQueueMsg,
} from '../../../../types'
import {
  getTopicIdsByKeyword,
  getTopicSubscriptionsByKeywords,
  getUnsubscriptionKeywordsByChannelId,
  remapSetObjectValuesToArrays,
} from '.'

export const handleNlpQueue = async (logger: Logger, abortSignal: AbortSignal) => {
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
    const topics = await selectBotTopicWithKeywords(db)
    await db.close()
    const topicIdsByKeyword = getTopicIdsByKeyword(topics)

    for (;;) {
      if (abortSignal.aborted) {
        logger.info({ info: 'Loop aborted' })
        break
      }
      const msg = await receiveNlpMessageCh.get(AMQP_NLP_TO_PUBLISHER_CHANNEL)
      if (!msg) {
        await delay(process.env.ENVIRONMENT === 'TESTING' ? 100 : EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      receiveNlpMessageTimeout(600_000, logger, msg)
      const db = await getDbConnection()
      const payload: TAmqpNLPToPublisherChannelMessage = JSON.parse(msg.content.toString())

      const queue: TPrePublisherDistributionQueue = {}

      // TODO: improve readability
      const keywordsByUser: Record<number, Set<string>> = {}
      const topicIdsByUser: Record<number, Set<number>> = {}
      const topicKeywordIdsByUser: Record<number, Record<string, number>> = {}
      const channelIdsByKeyword: Record<number, Record<string, Set<number>>> = {}
      const channelIdsByTopic: Record<number, Record<string, Set<number>>> = {}
      const tariffPlanByUsers: Record<number, 'free' | 'premium'> = {}

      const { channelIds, topicSubscriptionsByKeyword } = await getTopicSubscriptionsByKeywords(
        db,
        payload.matchedKeywords,
        topicIdsByKeyword,
      )

      const unsubscriptions =
        channelIds.size !== 0 && payload.matchedKeywords.length !== 0
          ? await selectBotTopicKeywordUnsubscriptions(db, [...channelIds], payload.matchedKeywords)
          : []
      const unsubscriptionKeywordsByChannelId =
        getUnsubscriptionKeywordsByChannelId(unsubscriptions)

      for (const keyword of payload.matchedKeywords) {
        const topicSubscriptions = topicSubscriptionsByKeyword[keyword] ?? []

        for (const { topicId, channelId } of topicSubscriptions) {
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
          topicIdsByUser[userId] ??= new Set<number>()
          topicIdsByUser[userId].add(topicId)

          channelIdsByTopic[userId] ??= {}
          channelIdsByTopic[userId][topicId] ??= new Set<number>()
          channelIdsByTopic[userId][topicId].add(channelId)

          channelIdsByKeyword[userId] ??= {}
          channelIdsByKeyword[userId][keyword] ??= new Set<number>()
          channelIdsByKeyword[userId][keyword].add(channelId)

          queue[userId].channelIds.push(channelId)
          topicKeywordIdsByUser[userId] ??= {}
          topicKeywordIdsByUser[userId][keyword] = topicId
        }
      }

      const subscriptions =
        payload.matchedKeywords.length !== 0
          ? await selectBotSubscriptionsByKeywords(db, payload.matchedKeywords)
          : []
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
          (topicKeywordIdsByUser[userId] && keyword in topicKeywordIdsByUser[userId])
        ) {
          continue
        }

        channelIdsByKeyword[userId] ??= {}
        channelIdsByKeyword[userId][keyword] ??= new Set<number>()
        channelIdsByKeyword[userId][keyword].add(channelId)

        keywordsByUser[userId] ??= new Set<string>()
        keywordsByUser[userId].add(keyword)
        queue[userId].channelIds.push(channelId)
      }
      await db.close()

      for (const userId in queue) {
        if (
          !queue[userId].channelIds.length ||
          (keywordsByUser[userId]?.size === 0 && topicIdsByUser[userId]?.size === 0)
        )
          continue

        const content: TPublisherDistributionQueueMsg = {
          userId: Number(userId),
          ...queue[userId],
          keywords: keywordsByUser[userId] ? [...keywordsByUser[userId]] : [],
          topicIds: topicIdsByUser[userId] ? [...topicIdsByUser[userId]] : [],
          topicKeywords: topicKeywordIdsByUser[userId] ?? {},
          channelIdsByKeyword: channelIdsByKeyword[userId]
            ? remapSetObjectValuesToArrays(channelIdsByKeyword[userId])
            : {},
          channelIdsByTopic: channelIdsByTopic[userId]
            ? remapSetObjectValuesToArrays(channelIdsByTopic[userId])
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
    if (receiveNlpMessageClearTimeout) receiveNlpMessageClearTimeout()
    if (receiveNlpMessageCh) await receiveNlpMessageCh.close()
    if (sendToPublisherDistributionCh) await sendToPublisherDistributionCh.close()
    if (amqp) await amqp.close()
  }
}
