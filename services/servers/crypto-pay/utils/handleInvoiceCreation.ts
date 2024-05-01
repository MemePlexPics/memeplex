import amqplib from 'amqplib'
import { CryptoPay, Assets } from '@foile/crypto-pay-api'
import { getAmqpQueue } from '../../../utils'
import { delay } from '../../../../utils'
import {
  AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL,
  AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL,
  EMPTY_QUEUE_RETRY_DELAY,
} from '../../../../constants'
import { Logger } from 'winston'
import { TInvoice } from '../types'
import { TAmqpCryptoPayToPublisherChannelMessage } from '../../../types'

export const handleInvoiceCreation = async (cryptoPay: CryptoPay, logger: Logger) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const [publisherToCryptoPayCh, distributionTimeout, distributionTimeotClear] = await getAmqpQueue(
    amqp,
    AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL,
  )
  const cryptoPayToPublisherCh = await amqp.createChannel()

  try {
    for (;;) {
      const msg = await publisherToCryptoPayCh.get(AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL)
      if (!msg) {
        await delay(EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      distributionTimeout(600_000, logger, msg)
      // TODO: type
      const payload = JSON.parse(msg.content.toString())
      const invoice: TInvoice = await cryptoPay.createInvoice(Assets.TON, 1, {
        description: `MemePush платный тариф для пользователя ${payload.user} (${payload.id})`,
        // expires_in: 60 * 60 * 24, // 24 hours
      })
      if (invoice.bot_invoice_url) {
        const content = Buffer.from(
          JSON.stringify({
            userId: payload.id,
            bot_invoice_url: invoice.bot_invoice_url,
          } as TAmqpCryptoPayToPublisherChannelMessage),
        )
        cryptoPayToPublisherCh.sendToQueue(AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL, content, {
          persistent: true,
        })
        publisherToCryptoPayCh.ack(msg)
      } else {
        publisherToCryptoPayCh.nack(msg)
      }
    }
  } finally {
    distributionTimeotClear()
    if (publisherToCryptoPayCh) await publisherToCryptoPayCh.close()
    if (amqp) await amqp.close()
  }
}
