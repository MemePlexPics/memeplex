import amqplib from 'amqplib'
import { TInvoicePaid } from '../types'
import { AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL } from '../../../../constants'

export const handlePaidInvoice = async (update: { payload: TInvoicePaid }) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const cryptoPayToPublisherCh = await amqp.createChannel()

  const userId = update.payload.description.match(/\((.+)\)/).at(-1)

  const content = Buffer.from(
    JSON.stringify({
      userId,
      status: update.payload.status,
    }),
  )
  cryptoPayToPublisherCh.sendToQueue(AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL, content, {
    persistent: true,
  })
}
