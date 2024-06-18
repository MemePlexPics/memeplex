import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL } from '../../../../constants'
import { getDbConnection } from '../../../../utils'
import { updateBotInvoiceStatus } from '../../../../utils/mysql-queries'

export const handlePaidInvoice = async (
  userId: number | string,
  invoiceId: number,
  amount: string,
) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const cryptoPayToPublisherCh = await amqp.createChannel()

  // TODO: type
  const content = Buffer.from(
    JSON.stringify({
      userId,
      amount,
      status: 'paid',
    }),
  )
  cryptoPayToPublisherCh.sendToQueue(AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL, content, {
    persistent: true,
  })
  const db = await getDbConnection()
  await updateBotInvoiceStatus(db, invoiceId, 'paid')
  await db.close()
  await cryptoPayToPublisherCh.close()
  await amqp.close()
}
