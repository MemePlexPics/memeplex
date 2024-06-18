import type { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'
import type { TTelegrafContext } from '../types'
import { ECallback, EMemeSuggestionCallback, chatIds } from '../constants'
import { Markup } from 'telegraf'
import { getTelegramUser } from '../../utils'

export const handleSuggestedMemePremoderation = async <GAction extends EMemeSuggestionCallback>(
  ctx: TTelegrafContext<Update.CallbackQueryUpdate<CallbackQuery>>,
  action: GAction,
  entityId: GAction extends EMemeSuggestionCallback.MESSAGE
    ? number
    : GAction extends EMemeSuggestionCallback.PHOTO
      ? string
      : never,
) => {
  if (action === EMemeSuggestionCallback.PHOTO) {
    const { user } = getTelegramUser(ctx.from)
    await ctx.telegram.sendPhoto(chatIds.memes, entityId as string)
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [[Markup.button.callback(`✅ by ${user}`, ECallback.IGNORE)]],
    })
  } else if (action === EMemeSuggestionCallback.MESSAGE) {
    if (!ctx.chat?.id) {
      throw new Error(`There is no chat_id`)
    }
    const { user } = getTelegramUser(ctx.from)
    await ctx.telegram.forwardMessage(chatIds.memes, ctx.chat?.id, Number(entityId), {
      // @ts-expect-error I not sute this is supported
      drop_author: true,
    })
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [[Markup.button.callback(`✅ by ${user}`, ECallback.IGNORE)]],
    })
  }
}
