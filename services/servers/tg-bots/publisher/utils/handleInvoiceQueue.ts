import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { Telegraf } from 'telegraf'
import { TTelegrafContext } from '../types'
import { Logger } from 'winston'
import { AMQP_CRYPTOPAY_TO_PUBLISHER_CHANNEL } from '../../../../../constants'
import { getAmqpQueue } from '../../../../utils'
import { delay, getDbConnection } from '../../../../../utils'
import {
  insertPublisherPremiumUser,
  selectPublisherPremiumUser,
} from '../../../../../utils/mysql-queries'
import { PREMIUM_PLANS } from '../../../../../constants/publisher'

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
      const payload: { userId: number } & (
        | { bot_invoice_url: string }
        | { status: 'paid'; amount: string }
      ) = JSON.parse(msg.content.toString())
      if ('bot_invoice_url' in payload) {
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
        const paidPlan = PREMIUM_PLANS.find(plan => plan.cost === Number(payload.amount))
        if (!paidPlan) {
          throw new Error(`Unknown premium plan was paid by ${payload.userId}: ${payload.amount}!`)
        }
        const db = await getDbConnection()
        const userPremium = await selectPublisherPremiumUser(db, payload.userId)
        const paidTime = 60 * 60 * 24 * 31 * paidPlan.months
        const untilTimestamp =
          userPremium.length !== 0 && userPremium[0].untilTimestamp > Date.now() / 1000
            ? userPremium[0].untilTimestamp + paidTime
            : Date.now() / 1000 + paidTime
        await insertPublisherPremiumUser(db, Number(payload.userId), untilTimestamp)
        await db.close()
        await bot.telegram.sendMessage(payload.userId, '🎉 Оплата успешно произведена!')
      } else {
        cryptoPayToPublisherCh.nack(msg)
        continue
      }
      cryptoPayToPublisherCh.ack(msg)
    }
  } finally {
    cryptoPayToPublisherTimeotClear()
    if (cryptoPayToPublisherCh) await cryptoPayToPublisherCh.close()
    if (amqp) await amqp.close()
  }
}
