import { KeyboardButton } from 'telegraf/typings/core/types/typegram'
import { TTelegrafContext } from './TTelegrafContext'

export type TMenuButton =
  | KeyboardButton
  | [string, (ctx: TTelegrafContext) => Promise<unknown> | unknown]
