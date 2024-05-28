import type { Channel, GetMessage } from 'amqplib'
import type { Logger } from 'winston'

export const handleNackByTimeout = (logger: Logger, msg: GetMessage, channel: Channel) => {
  if (channel && msg) {
    logger.info('Timeout occurred while waiting for acknowledgment')
    try {
      channel.nack(msg)
    } catch (e) {
      if (!(e instanceof Error) || !e.message.startsWith('Channel closed')) throw e
    }
  }
}
