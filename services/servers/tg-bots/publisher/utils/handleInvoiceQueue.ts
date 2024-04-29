import amqplib from 'amqplib'
import { Telegraf } from 'telegraf'
import { TTelegrafContext } from '../types'
import { Logger } from 'winston'
import { AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL } from '../../../../../constants'
import { getAmqpQueue } from '../../../../utils'
import { delay, getDbConnection } from '../../../../../utils'
import { insertPublisherPremiumUser } from '../../../../../utils/mysql-queries'

export const handleInvoiceQueue = async (bot: Telegraf<TTelegrafContext>, logger: Logger) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const [cryptoPayToPublisherCh, cryptoPayToPublisherTimeout, cryptoPayToPublisherTimeotClear] =
    await getAmqpQueue(amqp, AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL)

  try {
    for (;;) {
      const msg = await cryptoPayToPublisherCh.get(AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL)
      if (!msg) {
        await delay(1_000)
        continue
      }
      cryptoPayToPublisherTimeout(600_000, logger, msg)
      const payload: { userId: number; bot_invoice_url?: string; status?: 'paid' } = JSON.parse(
        msg.content.toString(),
      )
      if (payload.bot_invoice_url) {
        await bot.telegram.sendMessage(payload.userId, 'Ссылка для оплаты', {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Ссылка на оплату',
                  url: payload.bot_invoice_url,
                },
              ],
            ],
          },
        })
      } else if (payload.status === 'paid') {
        const db = await getDbConnection()
        await insertPublisherPremiumUser(db, payload.userId)
        await db.close()
        await bot.telegram.sendMessage(payload.userId, '🎉 Оплата успешно произведена!')
      }
    }
  } finally {
    cryptoPayToPublisherTimeotClear()
    if (cryptoPayToPublisherCh) await cryptoPayToPublisherCh.close()
    if (amqp) await amqp.close()
  }
}
