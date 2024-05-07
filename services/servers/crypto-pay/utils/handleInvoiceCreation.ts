import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { CryptoPay } from '@foile/crypto-pay-api'
import { getAmqpQueue } from '../../../utils'
import { delay, getDbConnection } from '../../../../utils'
import {
  AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL,
  AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL,
  CRYPTOPAY_INVOICE_EXPIRES_IN_SECONDS,
  EMPTY_QUEUE_RETRY_DELAY,
} from '../../../../constants'
import { Logger } from 'winston'
import { TInvoiceCreated } from '../types'
import { TAmqpCryptoPayToPublisherChannelMessage } from '../../../types'
import { insertPublisherInvoice } from '../../../../utils/mysql-queries'

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
      const invoice: TInvoiceCreated = await cryptoPay.createInvoice(undefined, undefined, {
        currency_type: 'fiat',
        fiat: 'USD',
        amount: '1',
        description: `MemePush платный тариф для пользователя ${payload.user} (${payload.id})`,
        expires_in: CRYPTOPAY_INVOICE_EXPIRES_IN_SECONDS,
      })
      if (invoice.bot_invoice_url) {
        const db = await getDbConnection()
        await insertPublisherInvoice(db, {
          id: invoice.invoice_id,
          hash: invoice.hash,
          userId: payload.id,
          status: invoice.status,
          createdAt: invoice.created_at,
        })
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
