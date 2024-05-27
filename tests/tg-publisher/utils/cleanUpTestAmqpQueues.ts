import amqplib from 'amqplib'
import * as queues from '../../../constants/amqpChannels'

export const cleanUpTestAmqpQueues = async () => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const channel = await amqp.createChannel()
  for (const queueName in queues) {
    await channel.deleteQueue(queueName)
  }
  await channel.close()
  await amqp.close()
}
