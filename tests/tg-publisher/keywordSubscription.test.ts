import TelegramServer from '@vishtar/telegram-test-api'
import { init } from '../../services/servers/tg-bots/pics/utils'
import { getTestLogger } from '../utils'
import {
  TelegramClientWrapper,
  buyPremium,
  cleanUpPublisherPremium,
  cleanUpPublisherUser,
  cleanUpTestAmqpQueues,
  subscribeToKeyword,
} from './utils'
import { CryptoPay } from '@foile/crypto-pay-api'
import { getDbConnection } from '../../utils'
import { ECryptoPayHostname } from '../../services/servers/crypto-pay/constants'
import { handleInvoiceCreation } from '../../services/servers/crypto-pay/utils'
import { i18n } from '../../services/servers/tg-bots/pics/i18n'
import type { Channel, Connection } from 'amqplib'
import amqplib from 'amqplib'
import { AMQP_NLP_TO_PUBLISHER_CHANNEL } from '../../constants'
import { mockAmqpNLPToPublisherChannelMessage } from './constants'
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { EKeywordAction, callbackData } from '../../services/servers/tg-bots/pics/constants'
import {
  deleteBotChannelById,
  deleteBotKeyword,
  deleteBotSubscriptionsByChannelId,
  selectBotChannelsByUserId,
} from '../../utils/mysql-queries'
import { botActions } from '../../db/schema'
import { eq } from 'drizzle-orm'

describe('Keyword subscribtion', () => {
  const serverConfig = { port: 0 }
  const token = '123456'
  let tgServer: TelegramServer
  let bot: Awaited<ReturnType<typeof init>>
  let tgClient: TelegramClientWrapper
  let tgClientSecond: TelegramClientWrapper
  let amqp: Connection
  let sendToPublisherDistributionCh: Channel
  let keywordFirstUserId: number
  let keywordSecondUserId: number

  const keywordFirstUser = 'donuts'
  const keywordSecondUser = 'walnuts'

  const logger = getTestLogger('cryptopay-bot')
  const cryptoPay: CryptoPay = new CryptoPay(process.env.CRYPTOPAY_BOT_TEST_TOKEN, {
    hostname: ECryptoPayHostname.TEST,
    webhook: {
      serverHostname: 'localhost',
      serverPort: 8804, // random port
      path: `/${process.env.CRYPTOPAY_BOT_TEST_WEBHOOK_PATH}`,
    },
  })
  // TODO: close it gentlier than deleten queue at cleanup
  handleInvoiceCreation(cryptoPay, logger)

  beforeAll(async () => {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    sendToPublisherDistributionCh = await amqp.createChannel()
    tgServer = new TelegramServer(serverConfig)
    bot = await init(token, { telegram: { apiRoot: tgServer.config.apiURL } }, undefined)
    await tgServer.start()
    bot.launch()
    tgClient = new TelegramClientWrapper(tgServer.config.apiURL, token, { timeout: 5000 })
    // tgClientSecond = new TelegramClientWrapper(tgServer.config.apiURL, token, {
    //   userId: 2,
    //   timeout: 5000,
    // })
    const db = await getDbConnection()
    await cleanUpPublisherPremium(db, cryptoPay)
    await db.close()
  })

  afterAll(async () => {
    const db = await getDbConnection()
    await db.delete(botActions).where(eq(botActions.userId, 1))
    await cleanUpPublisherPremium(db, cryptoPay)
    await cleanUpPublisherPremium(db, cryptoPay, 2)

    await deleteBotSubscriptionsByChannelId(db, 1)
    await deleteBotSubscriptionsByChannelId(db, 2)

    const channels = await selectBotChannelsByUserId(db, 1)
    for (const channel of channels) {
      await deleteBotChannelById(db, channel.id)
    }
    await cleanUpPublisherUser(db)
    await cleanUpPublisherUser(db, 2)
    await deleteBotKeyword(db, keywordFirstUser)
    await deleteBotKeyword(db, keywordSecondUser)
    await db.close()

    await cleanUpTestAmqpQueues()
  })

  test('Buy a premium for a first user', async () => {
    await buyPremium(tgClient)
  }, 60_000)

  // test('Buy a premium for a second user', async () => {
  //   await buyPremium(tgClientSecond)
  // }, 60_000)

  test('Keyword menu works', async () => {
    const keyword = await subscribeToKeyword(tgClient, keywordFirstUser)
    keywordFirstUserId = keyword.id
    // const seconUserKeyword = await subscribeToKeyword(tgClientSecond, keywordSecondUser)
    // keywordSecondUserId = seconUserKeyword.id
  })

  test('Subscription works', async () => {
    const buffer = Buffer.from(
      JSON.stringify({
        ...mockAmqpNLPToPublisherChannelMessage,
        matchedKeywords: [keywordFirstUser],
      }),
    )
    sendToPublisherDistributionCh.sendToQueue(AMQP_NLP_TO_PUBLISHER_CHANNEL, buffer, {
      persistent: true,
    })
    const updates = await tgClient.getUpdates()
    const preModerationMemeMessage = updates.result[0]
    const keywordUnsubscribeButton =
      preModerationMemeMessage.message.reply_markup.inline_keyboard.find(
        (row: InlineKeyboardButton[]) =>
          row.find(
            button =>
              'callback_data' in button &&
              button.callback_data ===
                callbackData.premoderation.keywordButton(
                  EKeywordAction.DELETE,
                  1,
                  keywordFirstUserId,
                ),
          ),
      )
    if (!keywordUnsubscribeButton) {
      throw new Error(
        `There is no unsubscription button for «${keywordFirstUser}»: ${JSON.stringify(preModerationMemeMessage, null, 2)}`,
      )
    }
  })

  test('Not added keywords shall not pass', async () => {
    const buffer = Buffer.from(
      JSON.stringify({
        ...mockAmqpNLPToPublisherChannelMessage,
        matchedKeywords: [keywordSecondUser],
      }),
    )
    sendToPublisherDistributionCh.sendToQueue(AMQP_NLP_TO_PUBLISHER_CHANNEL, buffer, {
      persistent: true,
    })
    try {
      // TODO: fix... something after this empty getUpdates()
      const updates = await tgClient.getUpdates()
      throw new Error(
        `There are unexpected udates for «${keywordSecondUser}»: ${JSON.stringify(updates, null, 2)}`,
      )
    } catch (error) {
      if (error instanceof Error) {
        expect(error.name).toBe('TimeoutError')
      } else {
        throw new Error(`Error isn't instance of Error: ${JSON.stringify(error, null, 2)}`)
      }
    }
  }, 10_000)

  test('Tested keyword deleted', async () => {
    const commaSeparatedKeywordUpdates = await tgClient.executeMessage(
      i18n['ru'].button.sendKeywords(),
    )
    const messageWithKeyword = commaSeparatedKeywordUpdates!.result.find(update =>
      update.message.text.includes(keywordFirstUser),
    )
    if (!messageWithKeyword) {
      throw new Error(
        `There is no update with «${keywordFirstUser}» keyword: ${JSON.stringify(commaSeparatedKeywordUpdates, null, 2)}`,
      )
    }
    const keywordSettingsUpdates = await tgClient.executeMessage(
      i18n['ru'].button.editKeywords('✏️'),
    )
    const keywordSettingsMenu = keywordSettingsUpdates!.result.find(
      update => update.message.text === i18n['ru'].message.unsubscribeFromKeywords(),
    )

    await tgClient.sendCallback(
      // TODO: get callback_data by a template
      tgClient.makeCallbackQuery(`${EKeywordAction.DELETE}|${keywordFirstUserId}`, {
        message: {
          // @ts-expect-error number to DeepPartial<any>
          message_id: keywordSettingsMenu.messageId,
          reply_markup: {
            inline_keyboard: keywordSettingsMenu!.message.reply_markup.inline_keyboard,
          },
        },
      }),
    )
    const updatedCommaSeparatedKeywordUpdates = await tgClient.executeMessage(
      i18n['ru'].button.sendKeywords(),
    )
    const messageWithDeletedKeyword = updatedCommaSeparatedKeywordUpdates!.result.find(update =>
      update.message.text.includes(keywordFirstUser),
    )
    if (messageWithDeletedKeyword) {
      throw new Error(
        `The keyword still in the comma separated list: ${JSON.stringify(updatedCommaSeparatedKeywordUpdates, null, 2)}`,
      )
    }
  }, 10_000)
})
