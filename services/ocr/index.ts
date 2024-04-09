import 'dotenv/config'
import amqplib, { Connection, Channel, GetMessage } from 'amqplib'
import process from 'process'
import { AMQP_IMAGE_FILE_CHANNEL, ELASTIC_INDEX, EMPTY_QUEUE_RETRY_DELAY } from '../../constants'
import { getElasticClient, delay, logError } from '../../utils'
import { recogniseText, getNewDoc, blackListChecker } from './utils'
import { Client } from '@elastic/elasticsearch'
import { getAmqpQueue } from '../utils'
import { handlePublisherDistribution } from './utils'
import { Logger } from 'winston'

// Listens for messages containing images, outputs messages containing OCR'd text
export const ocr = async (logger: Logger) => {
  let elastic: Client,
    amqp: Connection,
    receiveImageFileCh: Channel,
    botPublisherDistributionCh: Channel,
    receiveImageFileClearTimeout: () => void

  try {
    elastic = await getElasticClient()
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    let receiveImageFileTimeout: (ms: number, logger: Logger, msg: GetMessage) => void;
    [receiveImageFileCh, receiveImageFileTimeout, receiveImageFileClearTimeout] =
      await getAmqpQueue(amqp, AMQP_IMAGE_FILE_CHANNEL)
    botPublisherDistributionCh = await amqp.createChannel()

    for (;;) {
      const msg = await receiveImageFileCh.get(AMQP_IMAGE_FILE_CHANNEL)
      if (!msg) {
        await delay(EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      receiveImageFileTimeout(600_000, logger, msg)
      const { payload, texts } = await recogniseText(msg, logger)
      if (!texts.eng) {
        receiveImageFileCh.ack(msg)
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
          await handlePublisherDistribution(botPublisherDistributionCh, document, meme._id)
        } catch (error) {
          await logError(logger, error)
        }
      } else {
        logger.verbose(`Declined (stop words): ${payload.fileName}`)
      }
      receiveImageFileCh.ack(msg)
    }
  } finally {
    receiveImageFileClearTimeout()
    if (receiveImageFileCh) await receiveImageFileCh.close()
    if (amqp) await amqp.close()
    if (elastic) await elastic.close()
  }
}
