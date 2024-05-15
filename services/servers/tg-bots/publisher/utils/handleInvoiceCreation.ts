import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { getTelegramUser } from '../../utils'
import { TTelegrafContext } from '../types'
import { AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL } from '../../../../../constants'
import { i18n } from '../i18n'

export const handleInvoiceCreation = async (ctx: TTelegrafContext, amount: number) => {
  try {
    if (!ctx.from) {
      throw new Error('There is no ctx.from')
    }
    const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    const { id, user } = getTelegramUser(ctx.from)
    const publisherToCryptoPayCh = await amqp.createChannel()

    // TODO: type
    const content = Buffer.from(
      JSON.stringify({
        id,
        user,
        amount,
      }),
    )
    publisherToCryptoPayCh.sendToQueue(AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL, content, {
      persistent: true,
    })
  } catch (error) {
    await ctx.reply(i18n['ru'].message.somethingWentWrongTryLater())
  }
}
