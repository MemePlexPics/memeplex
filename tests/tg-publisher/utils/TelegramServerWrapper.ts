import TelegramServer from '@vishtar/telegram-test-api'
import { TelegramServerConfig } from '@vishtar/telegram-test-api/lib/telegramServer'
import { getChat, getChatAdministrators, getChatMembersCount } from '.'
import { ChatFromGetChat, ChatMemberAdministrator } from '@telegraf/types'

export class TelegramServerWrapper extends TelegramServer<{
  getChat: Record<number | string, Partial<ChatFromGetChat>>
  getChatAdministrators: Record<number | string, Partial<ChatMemberAdministrator>[]>
  getChatMembersCount: Record<number | string, number>
}> {
  constructor(config?: Partial<TelegramServerConfig>) {
    super(config, {
      routes: [getChat, getChatAdministrators, getChatMembersCount],
    })
  }
}
