import type { CallbackQuery, Message, Update } from 'telegraf/typings/core/types/typegram'
import type { TInlineMenu, TMenu, TTelegrafContext } from '.'
import type { Promisable } from '../../../../../types'
import type { EState } from '../constants'

export type TState = {
  stateName: EState
  beforeInit?: (ctx: TTelegrafContext) => Promisable<boolean>
  menu?: (ctx: TTelegrafContext) => Promisable<TMenu>
  inlineMenu?: (ctx: TTelegrafContext) => Promisable<TInlineMenu | false>
  message?: (ctx: TTelegrafContext) => Promisable<string>
  onCallback?: (
    ctx: TTelegrafContext<Update.CallbackQueryUpdate<CallbackQuery>>,
    callback: string,
  ) => Promisable<unknown>
  onText?: (
    ctx: TTelegrafContext<Update.MessageUpdate<Message.TextMessage>>,
    text: string,
  ) => Promisable<unknown>
}
