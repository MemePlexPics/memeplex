import type { Message } from 'telegraf/typings/core/types/typegram'

export const isCommonMessage = (message: unknown): message is Message.CommonMessage => {
  return 'reply_markup' in (message as Message.CommonMessage)
}
