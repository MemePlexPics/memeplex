/* global Buffer */
import 'dotenv/config'
import type { Channel, Connection } from 'amqplib'
import amqplib from 'amqplib'
import { AMQP_IMAGE_DATA_CHANNEL, TG_API_RATE_LIMIT } from '../../constants'
import { delay, getDbConnection } from '../../utils'
import { selectAvailableChannels, updateChannelTimestamp } from '../../utils/mysql-queries'
import process from 'process'
import { getMessagesAfter } from './utils'
import type { Logger } from 'winston'

const FLOOD_WAIT_INLINE_SEC = 60
const floodWaitUntil = new Map<string, number>()

const isFloodWaiting = (name: string) => {
  const until = floodWaitUntil.get(name)
  if (until === undefined) return false
  if (Date.now() >= until) {
    floodWaitUntil.delete(name)
    return false
  }
  return true
}

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
      if (isFloodWaiting(name)) {
        logger.verbose(`skipping ${name}: flood wait until ${new Date(floodWaitUntil.get(name)!).toISOString()}`)
        continue
      }

      let retry = true
      while (retry) {
        retry = false
        try {
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
        } catch (e) {
          // Aborting the whole cycle here would restart it from the first channel, so a single
          // unreachable or rate-limited channel would starve every channel after it.
          const message = e instanceof Error ? e.message : String(e)
          logger.error(message)
          const floodWait = message.match(/FLOOD_WAIT_(\d+)/)
          if (floodWait) {
            const seconds = Number(floodWait[1])
            floodWaitUntil.set(name, Date.now() + seconds * 1000)
            if (seconds <= FLOOD_WAIT_INLINE_SEC) {
              logger.warn(`${name}: Telegram asked to wait ${seconds}s`)
              await delay((seconds + 1) * 1000)
              floodWaitUntil.delete(name)
              retry = true
            } else {
              logger.warn(`${name}: skipping for ${seconds}s (until ${new Date(floodWaitUntil.get(name)!).toISOString()})`)
            }
          }
        }
      }
      await delay(TG_API_RATE_LIMIT)
    }
  } finally {
    if (sendImageDataCh) sendImageDataCh.close()
    if (amqp) amqp.close()
  }

  logger.info('fetched all channels, sleeping')
}
