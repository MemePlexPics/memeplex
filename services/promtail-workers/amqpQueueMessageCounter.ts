import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'

import * as queues from '../../constants/amqpChannels'
import { sendToLoki } from '../../utils'
import { Logger } from 'winston'

export const amqpQueueMessageCounter = async (_logger: Logger) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const lokiMessage: Record<string, number> = {}
  for (const queue in queues) {
    const queueName = queues[queue]
    const channel = await amqp.createChannel()
    const { messageCount } = await channel.assertQueue(queue)
    await channel.close()
    lokiMessage[queueName] = messageCount
  }
  await sendToLoki({ amqp: 'queue' }, [JSON.stringify(lokiMessage)])
}
