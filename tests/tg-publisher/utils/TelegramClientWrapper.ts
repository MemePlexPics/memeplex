import {
  CallbackQueryRequest,
  ClientOptions,
  CommandOptions,
  DeepPartial,
  MessageOptions,
  TelegramClient,
} from '@vishtar/telegram-test-api/lib/modules/telegramClient'
import { GetUpdatesResponse } from '@vishtar/telegram-test-api/lib/routes/client/getUpdates'

export class TelegramClientWrapper extends TelegramClient {
  public latestUpdates?: GetUpdatesResponse

  constructor(url: string, botToken: string, options?: Partial<ClientOptions>) {
    super(url, botToken, options)
  }

  public async executeMessage(
    messageText: string,
    options?: MessageOptions,
    requestUpdates?: boolean,
  ) {
    // @ts-expect-error private attribute
    console.log(this.userId, messageText)
    const command = this.makeMessage(messageText, options)
    const response = await this.sendMessage(command)
    if (!response.ok) {
      throw new Error(
        `Message response for «${messageText}» is not ok: ${JSON.stringify(response)}`,
      )
    }
    if (requestUpdates === false) {
      return
    }
    this.latestUpdates = await this.getUpdates()
    console.log(messageText, JSON.stringify(this.latestUpdates, null, 2))
    return this.latestUpdates
  }

  public async executeCommand(
    messageText: string,
    options?: CommandOptions,
    requestUpdates?: boolean,
  ) {
    // @ts-expect-error private attribute
    console.log(this.userId, messageText)
    const command = this.makeCommand(messageText, options)
    const response = await this.sendCommand(command)
    if (!response.ok) {
      throw new Error(
        `Command response for «${messageText}» is not ok: ${JSON.stringify(response)}`,
      )
    }
    if (requestUpdates === false) {
      return
    }
    this.latestUpdates = await this.getUpdates()
    console.log(messageText, JSON.stringify(this.latestUpdates, null, 2))
    return this.latestUpdates
  }

  public async executeCallback(
    data: string,
    options?: DeepPartial<CallbackQueryRequest>,
    requestUpdates?: boolean,
  ) {
    // @ts-expect-error private attribute
    console.log(this.userId, data)
    const command = this.makeCallbackQuery(data, options)
    const response = await this.sendCallback(command)
    if (!response.ok) {
      throw new Error(`Callback response for «${data}» is not ok: ${JSON.stringify(response)}`)
    }
    if (requestUpdates === false) {
      return
    }
    // TODO: why waitBotEdits doesn't resolve?
    // await tgServer.waitBotEdits()
    // const allUpdates = await tgClient.getUpdatesHistory()
    // const editedTopicUpdates = allUpdates.find(oldMessage => topicUpdates.result[1].messageId === oldMessage.messageId)
    // expect('message' in editedTopicUpdates).toBe(true)
    // const updatedTopicButtons = (editedTopicUpdates as StoredBotUpdate).message.reply_markup.inline_keyboard
    this.latestUpdates = await this.getUpdates()
    console.log(data, JSON.stringify(this.latestUpdates, null, 2))
    return this.latestUpdates
  }

  // public changeTimeout(timeout: number = 5_000) {
  //   // @ts-expect-error private atribute
  //   this.timeout = timeout
  // }
}
