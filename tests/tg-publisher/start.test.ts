import TelegramServer from '@vishtar/telegram-test-api'
import { init } from '../../services/servers/tg-bots/publisher/utils'
import { i18n } from '../../services/servers/tg-bots/publisher/i18n'
import { TelegramClientWrapper, cleanUpPublisherUser } from './utils'
import { getDbConnection } from '../../utils'

describe('/start', () => {
  const serverConfig = { port: 9001 }
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
  })

  afterAll(async () => {
    bot.stop()
    await tgServer.stop()
    const db = await getDbConnection()
    await cleanUpPublisherUser(db)
    await db.close()
  })

  test('Recieved /start message', async () => {
    const updates = await tgClient.executeCommand('/start')
    if (!updates) {
      throw new Error(`There is no updates after /start`)
    }
    expect(updates.result[0].message.text).toEqual(i18n['ru'].message.start())
  })
})
