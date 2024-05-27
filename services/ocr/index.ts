import 'dotenv/config'
import fs from 'fs/promises'
import type { Connection, Channel, GetMessage } from 'amqplib'
import amqplib from 'amqplib'
import process from 'process'
import { AMQP_IMAGE_FILE_CHANNEL, ELASTIC_INDEX, EMPTY_QUEUE_RETRY_DELAY } from '../../constants'
import { getElasticClient, delay, logError, InfoMessage } from '../../utils'
import { recogniseText, getNewDoc, blackListChecker } from './utils'
import type { Client } from '@elastic/elasticsearch'
import { getAmqpQueue } from '../utils'
import { handlePublisherDistribution } from './utils'
import type { Logger } from 'winston'
import type { TAmqpImageFileChannelMessage } from '../types'

// Listens for messages containing images, outputs messages containing OCR'd text
export const ocr = async (logger: Logger) => {
  let elastic: Client | undefined,
    amqp: Connection | undefined,
    receiveImageFileCh: Channel | undefined,
    receiveImageFileClearTimeout: (() => void) | undefined

  try {
    elastic = await getElasticClient()
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    let receiveImageFileTimeout: (ms: number, logger: Logger, msg: GetMessage) => void
    ;[receiveImageFileCh, receiveImageFileTimeout, receiveImageFileClearTimeout] =
      await getAmqpQueue(amqp, AMQP_IMAGE_FILE_CHANNEL)

    for (;;) {
      const msg = await receiveImageFileCh.get(AMQP_IMAGE_FILE_CHANNEL)
      if (!msg) {
        await delay(EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      receiveImageFileTimeout(600_000, logger, msg)
      const payload: TAmqpImageFileChannelMessage = JSON.parse(msg.content.toString())
      let texts: Record<'eng', string>
      try {
        texts = await recogniseText(payload, logger)
      } catch (error) {
        if (error instanceof InfoMessage && error.message.startsWith('E301')) {
          receiveImageFileCh.ack(msg)
          throw new InfoMessage(`${error.message} was caused by: ${JSON.stringify(payload)}`)
        }
        throw error
      }
      if (!texts.eng) {
        receiveImageFileCh.ack(msg)
        fs.unlink(payload.fileName)
        return
      }
      const didStopWordsCheckPassed = await blackListChecker(texts.eng)
      if (didStopWordsCheckPassed) {
        const document = getNewDoc(payload, texts)
        const meme = await elastic.index({
          index: ELASTIC_INDEX,
          document,
        })
        try {
          await handlePublisherDistribution(document, meme._id)
        } catch (error) {
          if (error instanceof Error) {
            await logError(logger, error)
          }
        }
      } else {
        fs.unlink(payload.fileName)
        logger.verbose(`Declined (stop words): ${payload.fileName}`)
      }
      receiveImageFileCh.ack(msg)
    }
  } finally {
    if (receiveImageFileClearTimeout) receiveImageFileClearTimeout()
    if (receiveImageFileCh) await receiveImageFileCh.close()
    if (amqp) await amqp.close()
    if (elastic) await elastic.close()
  }
}
