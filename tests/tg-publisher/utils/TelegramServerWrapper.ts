import TelegramServer from '@vishtar/telegram-test-api'
import type { TelegramServerConfig } from '@vishtar/telegram-test-api/lib/telegramServer'
import { getChat, getChatAdministrators, getChatMembersCount } from '.'
import type { ChatFromGetChat, ChatMemberAdministrator } from '@telegraf/types'
import type { Route } from '@vishtar/telegram-test-api/lib/routes/route'

export class TelegramServerWrapper extends TelegramServer<{
  getChat: Record<number | string, Partial<ChatFromGetChat>>
  getChatAdministrators: Record<number | string, Partial<ChatMemberAdministrator>[]>
  getChatMembersCount: Record<number | string, number>
}> {
  constructor(config?: Partial<TelegramServerConfig>) {
    super(config, {
      routes: [getChat as Route, getChatAdministrators as Route, getChatMembersCount as Route],
    })
  }
}
