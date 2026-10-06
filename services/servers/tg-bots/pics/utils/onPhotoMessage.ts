import { getTranslation } from '../i18n'
import { Markup } from 'telegraf'
import { EMemeSuggestionCallback } from '../constants'
import type { TTelegrafContext } from '../types'
import type { Message, Update } from 'telegraf/typings/core/types/typegram'
import { getDbConnection } from '../../../../../utils'
import { botMemeSuggestions } from '../../../../../db/schema'
import { eq } from 'drizzle-orm'
import { telegramChat } from '../../../../../constants'

export const onPhotoMessage = async (
  ctx: TTelegrafContext<Update.MessageUpdate<Message.PhotoMessage>>,
) => {
  const { caption, photo, media_group_id, message_id } = ctx.update.message
  let text = caption
  if (media_group_id) {
    const mediaGroupData = ctx.sessionInMemory.suggestedMemeTextByMediaGroupId
    if (mediaGroupData) {
      if (!caption) {
        if (mediaGroupData[0] === media_group_id) {
          text = mediaGroupData[1]
        } else {
          ctx.sessionInMemory.suggestedMemeTextByMediaGroupId = undefined
        }
      }
    } else if (caption) {
      ctx.sessionInMemory.suggestedMemeTextByMediaGroupId = [media_group_id, caption]
    }
  }
  const photoEntity = photo.at(-1)
  if (!photoEntity) {
    return
  }
  const db = await getDbConnection()
  // TODO: move it out
  await db.insert(botMemeSuggestions).ignore().values({
    userId: ctx.from.id,
    fileId: photoEntity.file_id,
    messageId: message_id,
    text,
  })
  const [suggestedMeme] = await db
    .select({ id: botMemeSuggestions.id })
    .from(botMemeSuggestions)
    .where(eq(botMemeSuggestions.fileId, photoEntity.file_id))
  const approveMemeButton = Markup.button.callback(
    getTranslation(ctx.from.language_code).button.approve(),
    `${EMemeSuggestionCallback.APPROVE}|${suggestedMeme.id}`,
  )
  const approveWithoutTextMemeButton = Markup.button.callback(
    getTranslation(ctx.from.language_code).button.approveWithoutText(),
    `${EMemeSuggestionCallback.APPROVE_WITHOUT_TEXT}|${suggestedMeme.id}`,
  )
  const declineMemeButton = Markup.button.callback(
    getTranslation(ctx.from.language_code).button.decline(),
    `${EMemeSuggestionCallback.DECLINE}|${suggestedMeme.id}`,
  )
  await ctx.telegram.sendPhoto(telegramChat.premoderation, photoEntity.file_id, {
    caption: text,
    reply_markup: {
      inline_keyboard: [[approveMemeButton, approveWithoutTextMemeButton], [declineMemeButton]],
    },
  })
  await db.close()
}
