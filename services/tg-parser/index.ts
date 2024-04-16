/* global Buffer */
import 'dotenv/config'
import amqplib, { Channel, Connection } from 'amqplib'
import { AMQP_IMAGE_DATA_CHANNEL } from '../../constants'
import { getDbConnection, getMysqlClient } from '../../utils'
import { selectAvailableChannels, updateChannelTimestamp } from '../../utils/mysql-queries'
import process from 'process'
import { getMessagesAfter } from './utils'
import { Logger } from 'winston'

export const tgParser = async (logger: Logger) => {
  let amqp: Connection, sendImageDataCh: Channel
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
        const imageData = Buffer.from(
          JSON.stringify({
            ...message,
          }),
        )
        sendImageDataCh.sendToQueue(AMQP_IMAGE_DATA_CHANNEL, imageData, { persistent: true })
        if (message.date > timestamp) {
          const mysql = await getMysqlClient()
          await updateChannelTimestamp(mysql, name, message.date)
          await mysql.end()
        }
      }
    }
  } finally {
    if (sendImageDataCh) sendImageDataCh.close()
    if (amqp) amqp.close()
  }

  logger.info('fetched all channels, sleeping')
}
