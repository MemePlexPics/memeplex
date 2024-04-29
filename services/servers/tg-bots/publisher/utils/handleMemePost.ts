import fs from 'fs/promises'
import { TTelegrafContext } from '../types'
import { getMeme } from '../../../utils'
import { Client } from '@elastic/elasticsearch'
import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import { updatePublisherChannelById } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { isCallbackButton, isCommonMessage } from '../typeguards'
import { ECallback } from '../constants'

export const handleMemePost = async (
  client: Client,
  ctx: TTelegrafContext,
  chatId: number,
  memeId: string,
) => {
  const meme = await getMeme(client, memeId)
  const replyToMeme = {
    reply_parameters: {
      message_id: ctx.callbackQuery.message.message_id,
    },
  }
  try {
    await ctx.telegram.sendPhoto(chatId, {
      source: await fs.readFile(meme.fileName),
    })
    if (isCommonMessage(ctx.callbackQuery.message)) {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: ctx.callbackQuery.message.reply_markup.inline_keyboard.map(row =>
          row.map(column => {
            if (
              isCallbackButton(column) &&
              column.callback_data === `${ECallback.POST}|${chatId}|${memeId}`
            ) {
              const [_, channel] = column.text.split('@')
              return {
                text: `✅ Отправлено в @${channel}`,
                callback_data: ECallback.IGNORE,
              }
            }
            return column
          }),
        ),
      })
    }
    await ctx.reply(i18n['ru'].message.memePostedSuccessfully, replyToMeme)
    logUserAction(ctx.from, {
      info: `Meme posted`,
      chatId,
      memeId,
    })
    const subscribers = await ctx.telegram.getChatMembersCount(chatId)
    const db = await getDbConnection()
    await updatePublisherChannelById(db, { subscribers }, chatId)
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === '400: Bad Request: need administrator rights in the channel chat'
    ) {
      await ctx.reply(i18n['ru'].message.adminRightForPost, replyToMeme)
      return
    }
    await ctx.answerCbQuery()
    throw error
  }
}
