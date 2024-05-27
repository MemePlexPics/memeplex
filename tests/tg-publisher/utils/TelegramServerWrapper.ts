import TelegramServer from '@vishtar/telegram-test-api'
import { TelegramServerConfig } from "@vishtar/telegram-test-api/lib/telegramServer"
import { getChat, getChatAdministrators, getChatMembersCount } from "."

export class TelegramServerWrapper extends TelegramServer {
  public mockApi: object

  constructor(config?: Partial<TelegramServerConfig>) {
    super(config, {
      routes: [getChat, getChatAdministrators, getChatMembersCount]
    })
    this.mockApi = {}
  }
}
