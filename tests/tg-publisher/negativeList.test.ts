import { handleNlpQueue } from '../../services/servers/tg-bots/publisher/utils/handleNlpQueue'

jest.mock('amqplib')
jest.mock('../../services/utils')
jest.mock('../../utils', () => {
  const originalModules = jest.requireActual('../../utils')
  return {
    ...originalModules,
    getDbConnection: jest.fn(),
  }
})
jest.mock('../../utils/mysql-queries')
jest.mock('../../services/servers/tg-bots/publisher/utils', () => {
  const originalModules = jest.requireActual('../../services/servers/tg-bots/publisher/utils')
  return {
    ...originalModules,
    getTopicSubscriptionsByKeywords: jest.fn(),
  }
})

import process from 'process'
import 'dotenv/config'
import amqplib from 'amqplib'
import { getTopicSubscriptionsByKeywords } from '../../services/servers/tg-bots/publisher/utils'
import type { Logger } from 'winston'
import { getAmqpQueue, getPublisherUserByChannelIdAndTariffPlan } from '../../services/utils'
import { getDbConnection } from '../../utils'
import {
  selectBotSubscriptionsByKeywords,
  selectBotTopicKeywordUnsubscriptions,
  selectBotTopicWithKeywords,
} from '../../utils/mysql-queries'
import type { TDbConnection } from '../../utils/types'
import { mockAmqpNLPToPublisherChannelMessage } from './constants'
import { initPublisherDistributionQueueMsg } from '../../services/ocr/utils'
import type { TPublisherDistributionQueueMsg } from '../../services/types'

describe('processMessages', () => {
  const processedMessages: TPublisherDistributionQueueMsg[] = []
  const mockConnect = jest.mocked(amqplib.connect)
  const mockCreateChannel = jest.fn()
  const mockSendToQueue = jest.fn((channel: string, buffer: Buffer, _options) => {
    processedMessages.push(JSON.parse(buffer.toString()))
    return true
  })
  const mockGetAmqpQueue = jest.mocked(getAmqpQueue)
  const mockGetDbConnection = jest.mocked(getDbConnection)
  const mockSelectBotTopicWithKeywords = jest.mocked(selectBotTopicWithKeywords)
  const mockGetTopicSubscriptionsByKeywords = jest.mocked(getTopicSubscriptionsByKeywords)
  const mockSelectBotSubscriptionsByKeywords = jest.mocked(selectBotSubscriptionsByKeywords)
  const mockSelectBotTopicKeywordUnsubscriptions = jest.mocked(selectBotTopicKeywordUnsubscriptions)
  const mockGetPublisherUserByChannelIdAndTariffPlan = jest.mocked(
    getPublisherUserByChannelIdAndTariffPlan,
  )

  let abortController: AbortController
  let logger: Logger

  const setupMocks = async (mockValues: {
    amqpMessage: unknown
    topics: Awaited<ReturnType<typeof selectBotTopicWithKeywords>>
    subscriptions: Awaited<ReturnType<typeof selectBotSubscriptionsByKeywords>>
    unsubscriptions: Awaited<ReturnType<typeof selectBotTopicKeywordUnsubscriptions>>
    topicSubscriptions: Awaited<ReturnType<typeof getTopicSubscriptionsByKeywords>>
    publisherUserByChannelId: (channelId: number) => number
  }) => {
    mockGetAmqpQueue.mockResolvedValue([
      {
        get: jest
          .fn()
          .mockResolvedValueOnce({
            content: {
              toString: jest.fn().mockReturnValueOnce(JSON.stringify(mockValues.amqpMessage)),
            },
          })
          .mockResolvedValue(null),
        ack: jest.fn(),
        close: jest.fn(),
      } as unknown as amqplib.Channel,
      jest.fn(),
      jest.fn(),
    ])

    mockGetDbConnection.mockResolvedValue({
      close: jest.fn(),
    } as unknown as TDbConnection)

    mockSelectBotTopicWithKeywords.mockResolvedValue(mockValues.topics)
    mockGetTopicSubscriptionsByKeywords.mockResolvedValue(mockValues.topicSubscriptions)
    mockSelectBotSubscriptionsByKeywords.mockResolvedValue(mockValues.subscriptions)
    mockSelectBotTopicKeywordUnsubscriptions.mockResolvedValue(mockValues.unsubscriptions)

    mockGetPublisherUserByChannelIdAndTariffPlan.mockImplementation(
      async (db, queue, tariffPlanByUsers, channelId, memeId, memeData) => {
        const userId = mockValues.publisherUserByChannelId(channelId)
        initPublisherDistributionQueueMsg(queue, userId, memeId, memeData)
        return userId
      },
    )
  }

  beforeEach(async () => {
    processedMessages.length = 0
    abortController = new AbortController()
    logger = { info: jest.fn(), error: jest.fn(), warn: jest.fn() } as unknown as Logger

    mockConnect.mockResolvedValue({
      createChannel: mockCreateChannel,
      close: jest.fn(),
    } as unknown as amqplib.Connection)

    mockCreateChannel.mockResolvedValue({
      sendToQueue: mockSendToQueue,
      close: jest.fn(),
    } as unknown as amqplib.Channel)
  })

  test('Should process messages correctly', async () => {
    await setupMocks({
      amqpMessage: {
        ...mockAmqpNLPToPublisherChannelMessage,
        matchedKeywords: ['keyword1', 'keyword2'],
      },
      topics: [
        { nameId: 1, keywordId: 1, keyword: 'keyword1' },
        { nameId: 2, keywordId: 2, keyword: 'keyword2' },
      ],
      subscriptions: [{ channelId: 102, keyword: 'keyword2' }],
      unsubscriptions: [{ channelId: 101, keyword: 'keyword1' }],
      topicSubscriptions: {
        channelIds: new Set([101, 102]),
        topicSubscriptionsByKeyword: {
          keyword1: [{ id: 1, topicId: 1, channelId: 101 }],
          keyword2: [{ id: 2, topicId: 2, channelId: 102 }],
        },
      },
      publisherUserByChannelId: channelId => {
        const userIdByChannelId: Record<number, number> = {
          101: 1,
          102: 2,
        }
        return userIdByChannelId[channelId] ?? 0
      },
    })
    setTimeout(() => abortController.abort())
    await handleNlpQueue(logger, abortController.signal)

    expect(mockConnect).toHaveBeenCalledWith(process.env.AMQP_ENDPOINT)
    expect(mockCreateChannel).toHaveBeenCalled()
    expect(mockGetAmqpQueue).toHaveBeenCalledWith(
      expect.any(Object),
      process.env.AMQP_NLP_TO_PUBLISHER_CHANNEL + '_test',
    )
    expect(
      processedMessages[0].userId === 1 &&
        processedMessages[0].channelIds.length === 1 &&
        processedMessages[0].channelIds[0] === 101 &&
        processedMessages[0].channelIdsByKeyword?.keyword1.length === 1 &&
        processedMessages[0].channelIdsByKeyword?.keyword1[0] === 101,
    ).toBe(true)
  })

  test('Should process messages with different mock values', async () => {
    await setupMocks({
      amqpMessage: {
        ...mockAmqpNLPToPublisherChannelMessage,
        matchedKeywords: ['keyword3'],
      },
      topics: [{ nameId: 3, keywordId: 3, keyword: 'keyword3' }],
      subscriptions: [],
      unsubscriptions: [],
      topicSubscriptions: {
        channelIds: new Set([103]),
        topicSubscriptionsByKeyword: {
          keyword3: [{ id: 3, topicId: 3, channelId: 103 }],
        },
      },
      publisherUserByChannelId: channelId => {
        const userIdByChannelId: Record<number, number> = {
          103: 3,
        }
        return userIdByChannelId[channelId] ?? 0
      },
    })

    setTimeout(() => abortController.abort())
    await handleNlpQueue(logger, abortController.signal)

    expect(mockConnect).toHaveBeenCalledWith(process.env.AMQP_ENDPOINT)
    expect(mockCreateChannel).toHaveBeenCalled()
    expect(mockGetAmqpQueue).toHaveBeenCalledWith(
      expect.any(Object),
      process.env.AMQP_NLP_TO_PUBLISHER_CHANNEL + '_test',
    )
    expect(
      processedMessages[0].userId === 3 &&
        processedMessages[0].channelIds.length === 1 &&
        processedMessages[0].channelIds[0] === 103 &&
        processedMessages[0].channelIdsByKeyword?.keyword3.length === 1 &&
        processedMessages[0].channelIdsByKeyword?.keyword3[0] === 103,
    ).toBe(true)
  })
})
