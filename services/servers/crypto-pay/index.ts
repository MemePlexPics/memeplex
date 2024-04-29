import process from 'process'
import 'dotenv/config'
import { CryptoPay } from '@foile/crypto-pay-api'
import { ECryptoPayHostname } from './constants'
import { loopRetrying } from '../../../utils'
import { handleInvoiceCreation, handlePaidInvoice } from './utils'
import { getLogger } from '../tg-bots/utils'

const logger = getLogger('cryptopay-bot')

const cryptoPay = new CryptoPay(process.env.CRYPTOPAY_BOT_TEST_TOKEN, {
  hostname: ECryptoPayHostname.TEST,
  webhook: {
    serverHostname: 'localhost',
    serverPort: 3804,
    path: `/${process.env.CRYPTOPAY_BOT_TEST_WEBHOOK_PATH}`,
  },
})

cryptoPay.on('invoice_paid', handlePaidInvoice)

const main = async () => {
  await loopRetrying(() => handleInvoiceCreation(cryptoPay, logger))
}

main()
