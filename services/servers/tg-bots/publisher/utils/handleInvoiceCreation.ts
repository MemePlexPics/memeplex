import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { getTelegramUser } from '../../utils'
import { TTelegrafContext } from '../types'
import { AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL } from '../../../../../constants'

export const handleInvoiceCreation = async (ctx: TTelegrafContext) => {
  try {
    const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    const { id, user } = getTelegramUser(ctx.from)
    const publisherToCryptoPayCh = await amqp.createChannel()

    // TODO: type
    const content = Buffer.from(
      JSON.stringify({
        id,
        user,
      }),
    )
    publisherToCryptoPayCh.sendToQueue(AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL, content, {
      persistent: true,
    })
  } catch (error) {
    await ctx.reply('Что-то пошло не так. Пожалуйста, повторите попытку позже.')
  }
}
