import { Markup } from 'telegraf'
import { EMemeSuggestionCallback, chatIds } from '../constants'
import type { TTelegrafContext } from '../types'
import type { Message, Update } from 'telegraf/typings/core/types/typegram'

export const onPhotoMessage = async (
  ctx: TTelegrafContext<Update.MessageUpdate<Message.PhotoMessage>>,
) => {
  const forwardedMessage = await ctx.forwardMessage(chatIds.premoderation)
  await ctx.telegram.sendMessage(chatIds.premoderation, `Ololo`, {
    reply_parameters: {
      message_id: forwardedMessage.message_id,
    },
    reply_markup: {
      inline_keyboard: [
        [
          Markup.button.callback(
            'Опубликовать',
            `${EMemeSuggestionCallback.MESSAGE}|${forwardedMessage.message_id}`,
          ),
        ],
      ],
    },
  })
}
