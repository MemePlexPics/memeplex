import TelegramServer from '@vishtar/telegram-test-api'
import { init } from '../../services/servers/tg-bots/publisher/utils'
import { i18n } from '../../services/servers/tg-bots/publisher/i18n'
import { getTestLogger } from '../utils'
import {
  TelegramClientWrapper,
  awaitPremiumActivation,
  backToMainMenuAfterBoughtPremium,
  cleanUpPublisherPremium,
  cleanUpPublisherUser,
  cleanUpTestAmqpQueues,
  createInvoiceByButtons,
  goToOneMonthPremiumButton,
} from './utils'
import { CryptoPay } from '@foile/crypto-pay-api'
import { getDbConnection } from '../../utils'
import { PREMIUM_PLANS } from '../../constants/publisher'
import { ECryptoPayHostname } from '../../services/servers/crypto-pay/constants'
import { botPublisherInvoices } from '../../db/schema'
import { handleInvoiceCreation } from '../../services/servers/crypto-pay/utils'
import { upsertPublisherPremiumUser } from '../../utils/mysql-queries'
import { sql } from 'drizzle-orm'

describe('Subscribed to premium', () => {
  const serverConfig = { port: 9001 }
  const token = '123456'
  let tgServer: TelegramServer
  let bot: Awaited<ReturnType<typeof init>>
  let tgClient: TelegramClientWrapper

  const oneMonthPremium = PREMIUM_PLANS.find(plan => plan.months === 1)
  if (!oneMonthPremium) {
    throw new Error(
      `There is no premium plan for one month: ${JSON.stringify(PREMIUM_PLANS, null, 2)}`,
    )
  }
  const logger = getTestLogger('cryptopay-bot')
  const cryptoPay: CryptoPay = new CryptoPay(process.env.CRYPTOPAY_BOT_TEST_TOKEN, {
    hostname: ECryptoPayHostname.TEST,
    webhook: {
      serverHostname: 'localhost',
      serverPort: 8804, // random port
      path: `/${process.env.CRYPTOPAY_BOT_TEST_WEBHOOK_PATH}`,
    },
  })
  let currentInvoice: typeof botPublisherInvoices.$inferSelect
  // TODO: close it gentlier than deleten queue at cleanup
  handleInvoiceCreation(cryptoPay, logger)

  beforeAll(async () => {
    tgServer = new TelegramServer(serverConfig)
    bot = await init(token, { telegram: { apiRoot: tgServer.config.apiURL } }, undefined)
    await tgServer.start()
    bot.launch()
    tgClient = new TelegramClientWrapper(tgServer.config.apiURL, token, { timeout: 5000 })
    const db = await getDbConnection()
    await cleanUpPublisherPremium(db, cryptoPay)
    await db.close()
  })

  afterAll(async () => {
    bot.stop()
    await tgServer.stop()
    const db = await getDbConnection()
    await cleanUpPublisherPremium(db, cryptoPay)
    await cleanUpPublisherUser(db)
    await db.close()

    await cleanUpTestAmqpQueues()
  })

  test('There is a button to buy a premium', async () => {
    await goToOneMonthPremiumButton(tgClient)
  })

  test('The button creates an invoice', async () => {
    currentInvoice = await createInvoiceByButtons(tgClient)
  }, 60_000)

  test(`Mocked paid invoice leads to «${i18n['ru'].message.paymentSuccessful()}» message`, async () => {
    await awaitPremiumActivation(tgClient, currentInvoice.id)
  })

  test(`Now it is a «${i18n['ru'].button.extendPremium()}» buttom in the main menu`, async () => {
    await backToMainMenuAfterBoughtPremium(tgClient)
  }, 10_000)

  test('Premium expired correctly', async () => {
    const db = await getDbConnection()
    await db.execute(sql`DELETE FROM telegraf_publisher_sessions WHERE \`key\` = '1:1'`)
    await upsertPublisherPremiumUser(db, {
      userId: 1,
      untilTimestamp: 0
    })
    const updates = await tgClient.executeCommand('/start')
    const mainMenuMessage = updates.result.find(update => update.message.text === i18n['ru'].message.mainMenu())
    const connectPremiumButton = mainMenuMessage.message.reply_markup.keyboard.find(row => row.find(button => button === i18n['ru'].button.subscribeToPremium()))
    if (!connectPremiumButton) {
      throw new Error(`Subscription didn't expired: ${JSON.stringify(mainMenuMessage, null, 2)}`)
    }
  })
})
