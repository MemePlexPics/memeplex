import { Channel, Connection, GetMessage } from 'amqplib'
import { handleNackByTimeout } from '.'
import { Logger } from 'winston'

export const getAmqpQueue = async (
  amqp: Connection,
  queue: string,
): Promise<[Channel, (ms: number, logger: Logger, msg: GetMessage) => void, () => void]> => {
  const channel = await amqp.createChannel()
  let timeoutId: NodeJS.Timeout

  await channel.assertQueue(queue, {
    durable: true,
  })
  await channel.prefetch(1) // let it process one message at a time

  const timeoutClear = () => clearTimeout(timeoutId)

  channel
    .on('close', timeoutClear)
    .on('error', timeoutClear)
    .on('ack', timeoutClear)
    .on('nack', timeoutClear)

  const timeoutSetter = (ms: number, logger: Logger, msg: GetMessage) => {
    timeoutId = setTimeout(() => handleNackByTimeout(logger, msg, channel), ms)
  }

  return [channel, timeoutSetter, timeoutClear]
}
