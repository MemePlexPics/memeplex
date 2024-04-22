import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const isCallbackButton = (
  button: unknown,
): button is InlineKeyboardButton.CallbackButton => {
  return 'callback_data' in (button as InlineKeyboardButton.CallbackButton)
}
