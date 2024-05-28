import type { Message } from 'telegraf/typings/core/types/typegram'

export const isTextMessage = (message: unknown): message is Message.TextMessage => {
  return 'text' in (message as Message.TextMessage)
}
