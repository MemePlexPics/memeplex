import { Markup } from 'telegraf'
import { EMemeSuggestionCallback, chatIds } from '../constants'
import type { TTelegrafContext } from '../types'
import type { Message, Update } from 'telegraf/typings/core/types/typegram'
import { getDbConnection } from '../../../../../utils'
import { botMemeSuggestions } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'

export const onPhotoMessage = async (
  ctx: TTelegrafContext<Update.MessageUpdate<Message.PhotoMessage>>,
) => {
  const { caption, photo } = ctx.update.message
  const db = await getDbConnection()
  for (const photoEntity of photo) {
    // TODO: move it out
    await db.insert(botMemeSuggestions).ignore().values({
      userId: ctx.from.id,
      fileId: photoEntity.file_id,
      text: caption,
    })
    const [suggestedMeme] = await db
      .select({ id: botMemeSuggestions.id })
      .from(botMemeSuggestions)
      .where(eq(botMemeSuggestions.fileId, photoEntity.file_id))
    await db.close()
    const approveMemeButton = Markup.button.callback(
      '👍 Опубликовать',
      `${EMemeSuggestionCallback.APPROVE}|${suggestedMeme.id}`,
    )
    const declineMemeButton = Markup.button.callback(
      '👎 Отклонить',
      `${EMemeSuggestionCallback.DECLINE}|${suggestedMeme.id}`,
    )
    await ctx.telegram.sendPhoto(chatIds.premoderation, photoEntity.file_id, {
      caption,
      reply_markup: {
        inline_keyboard: [[approveMemeButton, declineMemeButton]],
      },
    })
  }
}
