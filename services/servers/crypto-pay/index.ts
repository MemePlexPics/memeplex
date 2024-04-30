import process from 'process'
import 'dotenv/config'
import { CryptoPay } from '@foile/crypto-pay-api'
import { ECryptoPayHostname } from './constants'
import { loopRetrying } from '../../../utils'
import { handleInvoiceCreation, handlePaidInvoice } from './utils'
import { getLogger } from '../tg-bots/utils'
import { CYCLE_SLEEP_TIMEOUT, LOOP_RETRYING_DELAY } from '../../../constants'

const logger = getLogger('cryptopay-bot')

const cryptoPay: CryptoPay = new CryptoPay(process.env.CRYPTOPAY_BOT_TEST_TOKEN, {
  hostname: ECryptoPayHostname.TEST,
  webhook: {
    serverHostname: 'localhost',
    serverPort: 3804,
    path: `/${process.env.CRYPTOPAY_BOT_TEST_WEBHOOK_PATH}`,
  },
})

cryptoPay.on('invoice_paid', handlePaidInvoice)

const main = async () => {
  await loopRetrying(() => handleInvoiceCreation(cryptoPay, logger), {
    logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
  })
}

main()
