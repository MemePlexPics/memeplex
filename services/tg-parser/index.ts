/* global Buffer */
import 'dotenv/config'
import type { Channel, Connection } from 'amqplib'
import amqplib from 'amqplib'
import { AMQP_IMAGE_DATA_CHANNEL } from '../../constants'
import { getDbConnection } from '../../utils'
import { selectAvailableChannels, updateChannelTimestamp } from '../../utils/mysql-queries'
import process from 'process'
import { getMessagesAfter } from './utils'
import type { Logger } from 'winston'

export const tgParser = async (logger: Logger) => {
  let amqp: Connection | undefined, sendImageDataCh: Channel | undefined
  try {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    sendImageDataCh = await amqp.createChannel()

    const db = await getDbConnection()
    const channels = await selectAvailableChannels(db)
    await db.close()
    logger.info(`fetching ${channels.length} channels`)

    for (const { name, timestamp, withText } of channels) {
      for await (const message of getMessagesAfter(name, timestamp, withText, logger)) {
        logger.verbose(`new post image: ${JSON.stringify(message)}`)
        const imageData = Buffer.from(JSON.stringify(message))
        sendImageDataCh.sendToQueue(AMQP_IMAGE_DATA_CHANNEL, imageData, { persistent: true })
        if (message.date > timestamp) {
          const db = await getDbConnection()
          await updateChannelTimestamp(db, name, message.date)
          await db.close()
        }
      }
    }
  } finally {
    if (sendImageDataCh) sendImageDataCh.close()
    if (amqp) amqp.close()
  }

  logger.info('fetched all channels, sleeping')
}
