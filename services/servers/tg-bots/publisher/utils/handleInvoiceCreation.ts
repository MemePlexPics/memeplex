import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { getTelegramUser } from '../../utils'
import type { TTelegrafContext } from '../types'
import { AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL } from '../../../../../constants'
import { i18n } from '../i18n'
import type { TAmqpPublisherToCryptoPayChannelMessage } from '../../../../types'

export const handleInvoiceCreation = async (ctx: TTelegrafContext, amount: number) => {
  try {
    const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    const { id, user } = getTelegramUser(ctx.from)
    const publisherToCryptoPayCh = await amqp.createChannel()

    const content: TAmqpPublisherToCryptoPayChannelMessage = {
      id,
      user,
      amount,
    }
    const buffer = Buffer.from(JSON.stringify(content))
    publisherToCryptoPayCh.sendToQueue(AMQP_PUBLISHER_TO_CRYPTOPAY_CHANNEL, buffer, {
      persistent: true,
    })
  } catch (error) {
    await ctx.reply(i18n['ru'].message.somethingWentWrongTryLater())
  }
}
