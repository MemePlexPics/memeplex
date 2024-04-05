import amqplib from 'amqplib'

import { AMQP_IMAGE_DATA_CHANNEL, AMQP_IMAGE_FILE_CHANNEL, AMQP_CHECK_PROXY_CHANNEL, AMQP_PUBLISHER_DISTRIBUTION_CHANNEL } from "../../constants"
import { sendToLoki } from '../../utils'
import { Logger } from 'winston'

export const amqpQueueMessageCounter = async (logger: Logger) => {
  const queues = [
    AMQP_IMAGE_DATA_CHANNEL,
    AMQP_IMAGE_FILE_CHANNEL,
    AMQP_CHECK_PROXY_CHANNEL,
    AMQP_PUBLISHER_DISTRIBUTION_CHANNEL,
  ]
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const lokiMessage = {}
  for (const queue of queues) {
    const channel = await amqp.createChannel()
    const { messageCount } = await channel.assertQueue(queue)
    await channel.close()
    lokiMessage[queue] = messageCount
  }
  await sendToLoki({ amqp: 'queue' }, [JSON.stringify(lokiMessage)])
}
