import type { KeyboardButton, Message, Update } from 'telegraf/typings/core/types/typegram'
import type { TTelegrafContext } from './TTelegrafContext'

export type TMenuButton =
  | KeyboardButton
  | [
    string,
    (
      ctx: TTelegrafContext<Update.MessageUpdate<Message.TextMessage>>,
    ) => Promise<unknown> | unknown,
  ]
