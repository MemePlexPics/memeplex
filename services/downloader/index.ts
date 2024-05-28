/* global Buffer */
import 'dotenv/config'
import type { Channel, Connection, GetMessage } from 'amqplib'
import amqplib from 'amqplib'
import process from 'process'
import {
  AMQP_IMAGE_DATA_CHANNEL,
  AMQP_IMAGE_FILE_CHANNEL,
  EMPTY_QUEUE_RETRY_DELAY,
} from '../../constants'
import { delay } from '../../utils'
import { getAmqpQueue } from '../utils'
import { buildImagePath } from './utils'
import { isFileIgnored } from './utils'
import type { Logger } from 'winston'
import type { TAmqpImageDataChannelMessage } from '../types'

export const downloader = async (logger: Logger) => {
  let amqp: Connection,
    sendImageFileCh: Channel,
    receiveImageDataCh: Channel,
    receiveImageDataChTimeout: (ms: number, logger: Logger, msg: GetMessage) => void,
    receiveImageDataChClearTimeout: () => void

  try {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    sendImageFileCh = await amqp.createChannel()
    ;[receiveImageDataCh, receiveImageDataChTimeout, receiveImageDataChClearTimeout] =
      await getAmqpQueue(amqp, AMQP_IMAGE_FILE_CHANNEL)

    for (;;) {
      const msg = await receiveImageDataCh.get(AMQP_IMAGE_DATA_CHANNEL)
      if (!msg) {
        await delay(EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      receiveImageDataChTimeout(600_000, logger, msg)
      const payload: TAmqpImageDataChannelMessage = JSON.parse(msg.content.toString())
      const destination = await buildImagePath(payload)

      const isIgnored = await isFileIgnored(logger, destination, payload)
      if (!isIgnored) {
        const content = Buffer.from(
          JSON.stringify({
            ...payload,
            fileName: destination,
          }),
        )
        sendImageFileCh.sendToQueue(AMQP_IMAGE_FILE_CHANNEL, content, {
          persistent: true,
        })
      }
      receiveImageDataCh.ack(msg)
    }
  } finally {
    receiveImageDataChClearTimeout()
    if (sendImageFileCh) await sendImageFileCh.close()
    if (receiveImageDataCh) await receiveImageDataCh.close()
    if (amqp) await amqp.close()
  }
}
