import process from 'process'
import 'dotenv/config'
import { CryptoPay } from '@foile/crypto-pay-api'
import { ECryptoPayHostname } from './constants'
import { loopRetrying } from '../../../utils'
import { handleInvoiceCreation, handleMissedPaidInvoices, handlePaidInvoice } from './utils'
import { getLogger } from '../tg-bots/utils'
import { CYCLE_SLEEP_TIMEOUT, LOOP_RETRYING_DELAY } from '../../../constants'
import { TInvoice } from './types'

const logger = getLogger('cryptopay-bot')

const cryptoPay: CryptoPay = new CryptoPay(process.env.CRYPTOPAY_BOT_TEST_TOKEN, {
  hostname: ECryptoPayHostname.TEST,
  webhook: {
    serverHostname: 'localhost',
    serverPort: 3804,
    path: `/${process.env.CRYPTOPAY_BOT_TEST_WEBHOOK_PATH}`,
  },
})

cryptoPay.on('invoice_paid', async (update: { payload: TInvoice }) => {
  const userId = update.payload.description?.match(/\((.+)\)/)?.at(-1)
  if (!userId) {
    throw new Error(
      `There is no userId in an invoice description: ${JSON.stringify(update.payload)}`,
    )
  }
  await handlePaidInvoice(Number(userId), update.payload.invoice_id)
})

const main = async () => {
  loopRetrying(() => handleInvoiceCreation(cryptoPay, logger), {
    logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
  })
  loopRetrying(() => handleMissedPaidInvoices(cryptoPay), {
    logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
  })
}

await main()
