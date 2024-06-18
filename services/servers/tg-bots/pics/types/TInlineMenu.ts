import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export type TInlineMenu = {
  text: string
  buttons: InlineKeyboardButton[][]
}
