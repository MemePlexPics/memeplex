import TelegramServer from '@vishtar/telegram-test-api'
import { init } from '../../services/servers/tg-bots/pics/utils'
import { i18n } from '../../services/servers/tg-bots/pics/i18n'
import { PREMIUM_REQUEST_URL } from '../../constants/publisher'
import {
  TelegramClientWrapper,
  cleanUpPublisherPremium,
  cleanUpPublisherUser,
  goToAskForPremium,
  grantPremium,
} from './utils'
import { getDbConnection } from '../../utils'
import { telegrafSessions } from '../../db/schema'
import { upsertBotPremiumUser } from '../../utils/mysql-queries'
import { eq } from 'drizzle-orm'
import type { InlineKeyboardButton, KeyboardButton } from 'telegraf/typings/core/types/typegram'

describe('Ask for premium', () => {
  const serverConfig = { port: 0 }
  const token = '123456'
  let tgServer: TelegramServer
  let bot: Awaited<ReturnType<typeof init>>
  let tgClient: TelegramClientWrapper

  beforeAll(async () => {
    tgServer = new TelegramServer(serverConfig)
    bot = await init(token, { telegram: { apiRoot: tgServer.config.apiURL } }, undefined)
    await tgServer.start()
    bot.launch()
    tgClient = new TelegramClientWrapper(tgServer.config.apiURL, token, { timeout: 5000 })
    const db = await getDbConnection()
    await cleanUpPublisherPremium(db)
    await db.close()
  })

  afterAll(async () => {
    bot?.stop()
    await tgServer?.stop()
    const db = await getDbConnection()
    await cleanUpPublisherPremium(db)
    await cleanUpPublisherUser(db)
    await db.close()
  })

  test('There is a button to ask for premium', async () => {
    await goToAskForPremium(tgClient)
  })

  test(`«${i18n['ru'].button.askForPremium()}» sends a link to request premium`, async () => {
    const updates = await tgClient.executeMessage(i18n['ru'].button.askForPremium())
    if (!updates) {
      throw new Error(`There is no updates after pressed «${i18n['ru'].button.askForPremium()}»`)
    }
    const requestMessage = updates.result.find(
      update => update.message.text === i18n['ru'].message.askForPremium(),
    )
    if (!requestMessage) {
      throw new Error(`There is no premium request message: ${JSON.stringify(updates, null, 2)}`)
    }
    const requestButton = requestMessage.message.reply_markup.inline_keyboard
      .flat()
      .find(
        (button: InlineKeyboardButton) =>
          'url' in button &&
          button.url === PREMIUM_REQUEST_URL &&
          button.text === i18n['ru'].button.goToPremiumRequest(),
      )
    if (!requestButton) {
      throw new Error(
        `There is no link to ${PREMIUM_REQUEST_URL}: ${JSON.stringify(requestMessage, null, 2)}`,
      )
    }
  })

  test(`Premium can be granted without a payment`, async () => {
    await grantPremium(tgClient)
    const updates = await tgClient.executeCommand('/start')
    const mainMenuMessage = updates!.result.find(
      update => update.message.text === i18n['ru'].message.mainMenu(),
    )
    const askPremiumButton = mainMenuMessage!.message.reply_markup.keyboard.find(
      (row: KeyboardButton[]) => row.find(button => button === i18n['ru'].button.extendPremium()),
    )
    if (!askPremiumButton) {
      throw new Error(
        `There is no premium button after grant: ${JSON.stringify(mainMenuMessage, null, 2)}`,
      )
    }
  })

  test('Premium expired correctly', async () => {
    const db = await getDbConnection()
    await db.delete(telegrafSessions).where(eq(telegrafSessions.key, `1:1`))
    await upsertBotPremiumUser(db, {
      userId: 1,
      untilTimestamp: 0,
    })
    await db.close()
    const updates = await tgClient.executeCommand('/start')
    const mainMenuMessage = updates!.result.find(
      update => update.message.text === i18n['ru'].message.mainMenu(),
    )
    const connectPremiumButton = mainMenuMessage!.message.reply_markup.keyboard.find(
      (row: KeyboardButton[]) =>
        row.find(button => button === i18n['ru'].button.subscribeToPremium()),
    )
    if (!connectPremiumButton) {
      throw new Error(`Subscription didn't expired: ${JSON.stringify(mainMenuMessage, null, 2)}`)
    }
  })
})
