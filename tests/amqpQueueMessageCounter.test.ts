jest.mock('amqplib')
jest.mock('../constants/amqpChannels', () => ({
  __esModule: true,
  default: { TEST_QUEUE: 'test_queue' },
}))
jest.mock('../utils', () => ({ sendToLoki: jest.fn() }))

import amqplib from 'amqplib'
import type { Logger } from 'winston'
import { amqpQueueMessageCounter } from '../services/promtail-workers/amqpQueueMessageCounter'
import { sendToLoki } from '../utils'

describe('amqpQueueMessageCounter', () => {
  const closeConnection = jest.fn()
  const closeChannel = jest.fn()
  const assertQueue = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    assertQueue.mockResolvedValue({ messageCount: 7 })
    jest.mocked(amqplib.connect).mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue({
        assertQueue,
        close: closeChannel,
      }),
      close: closeConnection,
    } as unknown as amqplib.Connection)
  })

  test('closes the connection after reporting queue sizes', async () => {
    await amqpQueueMessageCounter({} as Logger)

    expect(assertQueue).toHaveBeenCalledWith('test_queue')
    expect(closeChannel).toHaveBeenCalledTimes(1)
    expect(sendToLoki).toHaveBeenCalledWith({ amqp: 'queue' }, ['{"test_queue":7}'])
    expect(closeConnection).toHaveBeenCalledTimes(1)
  })

  test('closes the connection when reporting fails', async () => {
    jest.mocked(sendToLoki).mockRejectedValueOnce(new Error('Loki unavailable'))

    await expect(amqpQueueMessageCounter({} as Logger)).rejects.toThrow('Loki unavailable')
    expect(closeConnection).toHaveBeenCalledTimes(1)
  })

  test('closes the connection when reading a queue fails', async () => {
    assertQueue.mockRejectedValueOnce(new Error('queue unavailable'))

    await expect(amqpQueueMessageCounter({} as Logger)).rejects.toThrow('queue unavailable')
    expect(closeConnection).toHaveBeenCalledTimes(1)
  })
})
