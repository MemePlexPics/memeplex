import { CryptoPay } from '@foile/crypto-pay-api'
import { init } from '../../services/servers/tg-bots/pics/utils'
import { getTestLogger } from '../utils'
import {
  TelegramClientWrapper,
  TelegramServerWrapper,
  buyPremium,
  cleanUpPublisherPremium,
  cleanUpPublisherUser,
  cleanUpTestAmqpQueues,
} from './utils'
import { getDbConnection } from '../../utils'
import { ECryptoPayHostname } from '../../services/servers/crypto-pay/constants'
import { handleInvoiceCreation } from '../../services/servers/crypto-pay/utils'
import { i18n } from '../../services/servers/tg-bots/pics/i18n'
import type { Channel, Connection } from 'amqplib'
import amqplib from 'amqplib'
import { AMQP_NLP_TO_PUBLISHER_CHANNEL } from '../../constants'
import { mockAmqpNLPToPublisherChannelMessage } from './constants'
import type { InlineKeyboardButton, KeyboardButton } from 'telegraf/typings/core/types/typegram'
import { callbackData } from '../../services/servers/tg-bots/pics/constants'
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
  let tgServer: TelegramServerWrapper
  let bot: Awaited<ReturnType<typeof init>>
  let tgClient: TelegramClientWrapper
  let amqp: Connection
  let sendToPublisherDistributionCh: Channel

  const keywordFirst = 'donuts'
  const testChannel = 'testChannel'

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
    tgServer = new TelegramServerWrapper(serverConfig)
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

    await deleteBotSubscriptionsByChannelId(db, 1)
    await deleteBotSubscriptionsByChannelId(db, 111)
    await deleteBotKeyword(db, keywordFirst)
    await db.delete(botActions).where(eq(botActions.userId, 1))
    const channels = await selectBotChannelsByUserId(db, 1)
    for (const channel of channels) {
      await deleteBotChannelById(db, channel.id)
    }
    await cleanUpPublisherUser(db)
    await db.close()

    await cleanUpTestAmqpQueues()
  })

  test('Buy a premium for a user', async () => {
    await buyPremium(tgClient)
  }, 60_000)

  test('Not added a channel without admin rights for bot', async () => {
    await tgClient.executeMessage(i18n['ru'].button.linkYourChannel())
    tgServer.storage.mockApi.getChat = {
      [testChannel]: {
        title: 'TestChannel',
        id: 111,
        type: 'channel',
        accent_color_id: 123,
      },
    }
    tgServer.storage.mockApi.getChatAdministrators = {
      [testChannel]: [
        {
          user: {
            id: tgClient.userId,
            is_bot: false,
            first_name: tgClient.firstName,
          },
        },
      ],
    }
    const addingChannelUpdates = await tgClient.executeMessage(`https://t.me/${testChannel}`)
    const needAdminRightsMessage = addingChannelUpdates!.result.find(
      update => update.message.text === i18n['ru'].message.botMustHaveAdminRights(),
    )
    if (!needAdminRightsMessage) {
      throw new Error(
        `There is no message about lack of admin rights: ${JSON.stringify(addingChannelUpdates, null, 2)}`,
      )
    }
  }, 60_000)

  test('Added channel with admin rights for the bot', async () => {
    tgServer.storage.mockApi.getChatAdministrators = {
      [testChannel]: [
        {
          user: {
            id: 1,
            is_bot: false,
            first_name: tgClient.firstName,
          },
        },
        {
          user: {
            id: 666,
            is_bot: true,
            first_name: 'TestNameBot',
          },
        },
      ],
    }
    tgServer.storage.mockApi.getChatMembersCount = {
      [testChannel]: 999,
    }
    const addingChannelUpdates = await tgClient.executeMessage(`https://t.me/${testChannel}`)
    const channelSettingMenuMessage = addingChannelUpdates!.result.find(
      update => update.message.text === i18n['ru'].message.thereTopicsAndKeywords(),
    )
    const channelButton = channelSettingMenuMessage!.message.reply_markup.keyboard.find(
      (row: KeyboardButton[]) =>
        row.find(button => button === i18n['ru'].button.unlinkChannel(testChannel)),
    )
    expect(channelButton).not.toBe(undefined)
  })

  test('Keyword subscription for the channel works', async () => {
    await tgClient.executeMessage(i18n['ru'].button.editKeywords('✏️', testChannel))
    await tgClient.executeMessage(keywordFirst)
    const buffer = Buffer.from(
      JSON.stringify({
        ...mockAmqpNLPToPublisherChannelMessage,
        matchedKeywords: [keywordFirst],
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
                callbackData.premoderation.postButton(
                  111,
                  mockAmqpNLPToPublisherChannelMessage.memeId,
                ),
          ),
      )
    if (!keywordUnsubscribeButton) {
      throw new Error(
        `There is no post meme button for «TestChannel»: ${JSON.stringify(preModerationMemeMessage, null, 2)}`,
      )
    }
    // TODO: investigate way to recieve channel messages
    await tgClient.sendCallback(
      tgClient.makeCallbackQuery(
        callbackData.premoderation.postButton(111, mockAmqpNLPToPublisherChannelMessage.memeId),
        {
          message: {
            // @ts-expect-error number to DeepPartial<any>
            message_id: preModerationMemeMessage.messageId,
            reply_markup: {
              inline_keyboard: preModerationMemeMessage.message.reply_markup.inline_keyboard,
            },
          },
        },
      ),
    )
  }, 10_000)

  test(`Meme wasn't posted if there are no admin rights for bot`, async () => {
    tgServer.storage.mockApi.getChatAdministrators = {
      [testChannel]: [
        {
          user: {
            id: 1,
            is_bot: false,
            first_name: tgClient.firstName,
          },
        },
      ],
    }
    const buffer = Buffer.from(
      JSON.stringify({
        ...mockAmqpNLPToPublisherChannelMessage,
        matchedKeywords: [keywordFirst],
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
                callbackData.premoderation.postButton(
                  111,
                  mockAmqpNLPToPublisherChannelMessage.memeId,
                ),
          ),
      )
    if (!keywordUnsubscribeButton) {
      throw new Error(
        `There is no post meme button for «TestChannel»: ${JSON.stringify(preModerationMemeMessage, null, 2)}`,
      )
    }
    // TODO: investigate way to recieve channel messages
    await tgClient.sendCallback(
      tgClient.makeCallbackQuery(
        callbackData.premoderation.postButton(111, mockAmqpNLPToPublisherChannelMessage.memeId),
        {
          message: {
            // @ts-expect-error number to DeepPartial<any>
            message_id: preModerationMemeMessage.messageId,
            reply_markup: {
              inline_keyboard: preModerationMemeMessage.message.reply_markup.inline_keyboard,
            },
          },
        },
      ),
    )
  })

  test('Unlink channel', async () => {
    await tgClient.executeMessage(i18n['ru'].button.back())
    const unlinkChannelUpdates = await tgClient.executeMessage(
      i18n['ru'].button.unlinkChannel(testChannel),
    )
    const confirmationMessage = unlinkChannelUpdates!.result.find(
      update => update.message.text === i18n['ru'].message.doYouWantToUnlinkChannel(testChannel),
    )
    expect(confirmationMessage).not.toBe(undefined)
    // TODO: unlink into variable
    await tgClient.executeCallback('unlink')
  })

  test(`Relinked channel doesn't have keywords`, async () => {
    await tgClient.executeCommand('/menu')
    await tgClient.executeMessage(i18n['ru'].button.linkYourChannel())
    tgServer.storage.mockApi.getChatAdministrators = {
      [testChannel]: [
        {
          user: {
            id: 1,
            is_bot: false,
            first_name: tgClient.firstName,
          },
        },
        {
          user: {
            id: 666,
            is_bot: true,
            first_name: 'TestNameBot',
          },
        },
      ],
    }
    const addingChannelUpdates = await tgClient.executeMessage(`https://t.me/${testChannel}`)
    const channelSettingMenuMessage = addingChannelUpdates!.result.find(
      update => update.message.text === i18n['ru'].message.thereTopicsAndKeywords(),
    )
    const channelButton = channelSettingMenuMessage!.message.reply_markup.keyboard.find(
      (row: KeyboardButton[]) =>
        row.find(button => button === i18n['ru'].button.unlinkChannel(testChannel)),
    )
    expect(channelButton).not.toBe(undefined)
    const keywordSettingsMenuUpdates = await tgClient.executeMessage(
      i18n['ru'].button.editKeywords('✏️', testChannel),
    )
    const keywordListMenuMessage = keywordSettingsMenuUpdates!.result.find(
      update =>
        update.message.text === i18n['ru'].message.youEditingSubscriptionsForChannel(testChannel),
    )
    expect(keywordListMenuMessage).toBe(undefined)
  })
})
