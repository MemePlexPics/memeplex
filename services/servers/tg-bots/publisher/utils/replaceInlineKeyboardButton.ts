import { isCommonMessage, isCallbackButton } from '../typeguards'
import { TTelegrafContext } from '../types'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'

export const replaceInlineKeyboardButton = async (
  ctx: TTelegrafContext,
  replace: { [oldCallback: string]: InlineKeyboardButton },
) => {
  if (
    isCommonMessage(ctx.callbackQuery?.message) &&
    ctx.callbackQuery.message.reply_markup?.inline_keyboard
  ) {
    await ctx.editMessageReplyMarkup({
      inline_keyboard: ctx.callbackQuery.message.reply_markup.inline_keyboard.map(row =>
        row.map(column => {
          if (isCallbackButton(column) && column.callback_data in replace) {
            return replace[column.callback_data]
          }
          return column
        }),
      ),
    })
  } else {
    throw new Error(
      `An atempt to replace an inline keyboard button in a message without reply markup`,
    )
  }
}
