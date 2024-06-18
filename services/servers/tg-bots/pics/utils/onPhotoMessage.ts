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
  const { caption, photo, media_group_id } = ctx.update.message
  let text = caption
  if (media_group_id) {
    const mediaGroupData = ctx.sessionInMemory.suggestedMemeTextByMediaGroupId
    if (mediaGroupData) {
      if (!caption) {
        if (mediaGroupData[0] === media_group_id) {
          text = mediaGroupData[1]
        }
      } else {
        ctx.sessionInMemory.suggestedMemeTextByMediaGroupId = [media_group_id, caption]
      }
    }
  }
  const db = await getDbConnection()
  for (const photoEntity of photo) {
    // TODO: move it out
    await db.insert(botMemeSuggestions).ignore().values({
      userId: ctx.from.id,
      fileId: photoEntity.file_id,
      text,
    })
    const [suggestedMeme] = await db
      .select({ id: botMemeSuggestions.id })
      .from(botMemeSuggestions)
      .where(eq(botMemeSuggestions.fileId, photoEntity.file_id))
    const approveMemeButton = Markup.button.callback(
      '👍 Опубликовать',
      `${EMemeSuggestionCallback.APPROVE}|${suggestedMeme.id}`,
    )
    const approveWithoutTextMemeButton = Markup.button.callback(
      '🖼 Без текста',
      `${EMemeSuggestionCallback.APPROVE_WITHOUT_TEXT}|${suggestedMeme.id}`,
    )
    const declineMemeButton = Markup.button.callback(
      '👎 Отклонить',
      `${EMemeSuggestionCallback.DECLINE}|${suggestedMeme.id}`,
    )
    await ctx.telegram.sendPhoto(chatIds.premoderation, photoEntity.file_id, {
      caption: text,
      reply_markup: {
        inline_keyboard: [[approveMemeButton, approveWithoutTextMemeButton], [declineMemeButton]],
      },
    })
  }
  await db.close()
}
