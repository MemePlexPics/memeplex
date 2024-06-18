import type { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'
import type { TTelegrafContext } from '../types'
import { ECallback, EMemeSuggestionCallback, chatIds } from '../constants'
import { Markup } from 'telegraf'
import { getTelegramUser } from '../../utils'
import { getDbConnection } from '../../../../../utils'
import { botMemeSuggestions } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'

export const handleSuggestedMemePremoderation = async <GAction extends EMemeSuggestionCallback>(
  ctx: TTelegrafContext<Update.CallbackQueryUpdate<CallbackQuery>>,
  action: GAction,
  suggestionId: number,
) => {
  const { user } = getTelegramUser(ctx.from)
  const db = await getDbConnection()
  const [suggestedMeme] = await db
    .select()
    .from(botMemeSuggestions)
    .where(eq(botMemeSuggestions.id, suggestionId))
  if (action === EMemeSuggestionCallback.APPROVE) {
    await ctx.telegram.sendPhoto(chatIds.memes, suggestedMeme.fileId, {
      caption: suggestedMeme.text || undefined,
    })
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [[Markup.button.callback(`✅ by ${user}`, ECallback.IGNORE)]],
    })
  } else if (action === EMemeSuggestionCallback.DECLINE) {
    await ctx.editMessageReplyMarkup({
      inline_keyboard: [[Markup.button.callback(`❌ by ${user}`, ECallback.IGNORE)]],
    })
  }
  await db.delete(botMemeSuggestions).where(eq(botMemeSuggestions.id, suggestionId))
  await db.close()
}
