import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL } from '../../../../constants'
import { getDbConnection } from '../../../../utils'
import { updatePublisherInvoiceStatus } from '../../../../utils/mysql-queries'

export const handlePaidInvoice = async (userId: number | string, invoiceId: number) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const cryptoPayToPublisherCh = await amqp.createChannel()

  const content = Buffer.from(
    JSON.stringify({
      userId,
      status: 'paid',
    }),
  )
  cryptoPayToPublisherCh.sendToQueue(AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL, content, {
    persistent: true,
  })
  const db = await getDbConnection()
  await updatePublisherInvoiceStatus(db, invoiceId, 'paid')
}
