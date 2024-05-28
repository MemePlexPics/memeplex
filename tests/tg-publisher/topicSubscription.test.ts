import type { Channel, Connection } from 'amqplib'
import amqplib from 'amqplib'
import TelegramServer from '@vishtar/telegram-test-api'
import { init } from '../../services/servers/tg-bots/publisher/utils'
import { i18n } from '../../services/servers/tg-bots/publisher/i18n'
import { TelegramClientWrapper, cleanUpPublisherUser } from './utils'
import { ETopicAction, callbackData } from '../../services/servers/tg-bots/publisher/constants'
import { AMQP_NLP_TO_PUBLISHER_CHANNEL } from '../../constants'
import { getDbConnection } from '../../utils'
import {
  deleteBotChannelById,
  deleteBotTopicSubscriptionByChannelId,
  selectBotChannelsByUserId,
} from '../../utils/mysql-queries'
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import type { StoredBotUpdate } from '@vishtar/telegram-test-api/lib/telegramServer'
import { mockAmqpNLPToPublisherChannelMessage } from './constants'

describe('Topic subscription works', () => {
  const serverConfig = { port: 0 }
  const token = '123456'
  let tgServer: TelegramServer
  let bot: Awaited<ReturnType<typeof init>>
  let tgClient: TelegramClientWrapper
  let amqp: Connection
  let sendToPublisherDistributionCh: Channel
  let topicsMenu: StoredBotUpdate

  beforeAll(async () => {
    amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    sendToPublisherDistributionCh = await amqp.createChannel()
    tgServer = new TelegramServer(serverConfig)
    bot = await init(token, { telegram: { apiRoot: tgServer.config.apiURL } }, undefined)
    await tgServer.start()
    bot.launch()
    tgClient = new TelegramClientWrapper(tgServer.config.apiURL, token, { timeout: 5000 })
  })

  beforeEach(async () => {})

  afterEach(async () => {
    sendToPublisherDistributionCh.purgeQueue(AMQP_NLP_TO_PUBLISHER_CHANNEL)
  })

  afterAll(async () => {
    bot.stop()
    await tgServer.stop()
    const db = await getDbConnection()
    await deleteBotTopicSubscriptionByChannelId(db, 1)
    const channels = await selectBotChannelsByUserId(db, 1)
    for (const channel of channels) {
      await deleteBotChannelById(db, channel.id)
    }
    await cleanUpPublisherUser(db)
    await db.close()
  })

  test('There is a working button to subscribe to a topic', async () => {
    await tgClient.executeCommand('/start')
    await tgClient.executeMessage(i18n['ru'].button.mySubscriptions())
    const topicUpdates = await tgClient.executeMessage(i18n['ru'].button.editTopics('✨'))
    if (!topicUpdates) {
      throw new Error(`There is no topic menu updates`)
    }
    topicsMenu = topicUpdates.result[1]
    const topicsMenuButtons = topicsMenu.message.reply_markup.inline_keyboard
    const firstButton = topicsMenuButtons[0][0]
    if (!('callback_data' in firstButton)) {
      throw new Error(
        `Fisrt button isn't callback button as was expected: ${JSON.stringify(firstButton, null, 2)}`,
      )
    }
    const firstTopicSubscriptionButton =
      topicsMenuButtons[0][0] as InlineKeyboardButton.CallbackButton
    expect(firstTopicSubscriptionButton.callback_data.startsWith(ETopicAction.SUBSCRIBE)).toBe(true)

    await tgClient.sendCallback(
      tgClient.makeCallbackQuery(firstTopicSubscriptionButton.callback_data, {
        message: {
          // @ts-expect-error number to DeepPartial<any>
          message_id: topicsMenu.messageId,
          reply_markup: {
            inline_keyboard: topicsMenuButtons,
          },
        },
      }),
    )

    const editedTopicUpdates = await tgClient.executeCommand('/menu')
    if (!editedTopicUpdates) {
      throw new Error(`There is no updated topic menu`)
    }
    topicsMenu = editedTopicUpdates.result[1]
    const updatedTopicButtons = topicsMenu.message.reply_markup.inline_keyboard

    const firstTopicUnsubscriptionButton = updatedTopicButtons[0][0]
    expect(firstTopicUnsubscriptionButton.callback_data).not.toBe(
      firstTopicSubscriptionButton.callback_data,
    )
  })

  test('Meme with the topic keyword has come for pre-moderation', async () => {
    const buffer = Buffer.from(
      JSON.stringify({
        ...mockAmqpNLPToPublisherChannelMessage,
        matchedKeywords: ['btc'],
      }),
    )
    sendToPublisherDistributionCh.sendToQueue(AMQP_NLP_TO_PUBLISHER_CHANNEL, buffer, {
      persistent: true,
    })
    const updates = await tgClient.getUpdates()
    const preModerationMemeMessage = updates.result[0]
    const topicUnsubscribeButton =
      preModerationMemeMessage.message.reply_markup.inline_keyboard.find(
        (row: InlineKeyboardButton[]) =>
          row.find(
            button =>
              'callback_data' in button &&
              button.callback_data ===
                callbackData.premoderation.topicButton(ETopicAction.UNSUBSCRIBE, 1, 1),
          ),
      )
    expect(topicUnsubscribeButton).not.toBe(undefined)
  })

  test('Unsubscribed from topic successfully', async () => {
    await tgClient.sendCallback(
      // TODO: get callback_data by a template
      tgClient.makeCallbackQuery(`${ETopicAction.UNSUBSCRIBE}|1`, {
        message: {
          // @ts-expect-error number to DeepPartial<any>
          message_id: topicsMenu.messageId,
          reply_markup: {
            inline_keyboard: topicsMenu.message.reply_markup.inline_keyboard,
          },
        },
      }),
    )
    const editedTopicUpdates = await tgClient.executeCommand('/menu')
    if (!editedTopicUpdates) {
      throw new Error(`There is no updated topic menu`)
    }
    const updatedTopicButtons = editedTopicUpdates.result[1].message.reply_markup.inline_keyboard
    expect(updatedTopicButtons[0][0].callback_data).toBe(`${ETopicAction.SUBSCRIBE}|1`)
  }, 10_000)

  test("Meme with a random keywort hasn't come for pre-moderation", async () => {
    const buffer = Buffer.from(
      JSON.stringify({
        ...mockAmqpNLPToPublisherChannelMessage,
        matchedKeywords: ['42'],
      }),
    )
    sendToPublisherDistributionCh.sendToQueue(AMQP_NLP_TO_PUBLISHER_CHANNEL, buffer, {
      persistent: true,
    })
    try {
      const updates = await tgClient.getUpdates()
      throw new Error(`There are shouln't be any upates: ${JSON.stringify(updates, null, 2)}`)
    } catch (error) {
      if (error instanceof Error) {
        expect(error.name).toBe('TimeoutError')
      } else {
        throw new Error(`Error isn't instance of Error: ${JSON.stringify(error, null, 2)}`)
      }
    }
  }, 10_000)
})
