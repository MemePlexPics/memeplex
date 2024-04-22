import { Message } from 'telegraf/typings/core/types/typegram'

export const isCommonMessage = (message: unknown): message is Message.CommonMessage => {
  return 'callback_data' in (message as Message.CommonMessage)
}
