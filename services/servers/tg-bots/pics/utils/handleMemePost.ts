import fs from 'fs/promises'
import type { TTelegrafContext } from '../types'
import { getMeme } from '../../../utils'
import { handlePaywall, logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import {
  insertBotAction,
  selectBotChannelById,
  updateBotChannelById,
} from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'
import { isCallbackButton, isCommonMessage } from '../typeguards'
import { ECallback, callbackData } from '../constants'
import { Markup } from 'telegraf'
import type { CallbackQuery, Update } from 'telegraf/typings/core/types/typegram'
import { MAX_FREE_USER_CHANNEL_SUBS } from '../../../../../constants'

export const handleMemePost = async (
  ctx: TTelegrafContext<Update.CallbackQueryUpdate<CallbackQuery>>,
  chatId: number,
  memeId: string,
) => {
  const db = await getDbConnection()
  const replyToMeme = ctx.callbackQuery?.message
    ? {
      reply_parameters: {
        message_id: ctx.callbackQuery.message.message_id,
      },
    }
    : undefined
  try {
    const subscribers = await ctx.telegram.getChatMembersCount(chatId)
    await updateBotChannelById(db, { subscribers }, chatId)
    const [channel] = await selectBotChannelById(db, chatId)
    if (subscribers > MAX_FREE_USER_CHANNEL_SUBS) {
      const paywalText = i18n['ru'].message.channelSubscribersLimitForFreePlan(channel.username)
      const doesPassedPaywall = await handlePaywall(ctx, paywalText)
      if (!doesPassedPaywall) {
        return
      }
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === '400: Bad Request: chat not found'
    ) {
      await ctx.reply(i18n['ru'].message.adminRightForPost(), replyToMeme)
      return
    }
  }
  const meme = await getMeme(ctx.elastic, memeId)
  try {
    const postedMeme = await ctx.telegram.sendPhoto(chatId, {
      source: await fs.readFile(meme.fileName),
    })
    if (isCommonMessage(ctx.callbackQuery?.message) && ctx.callbackQuery.message.reply_markup) {
      await ctx.editMessageReplyMarkup({
        inline_keyboard: ctx.callbackQuery.message.reply_markup.inline_keyboard.map(row =>
          row.map(column => {
            if (
              isCallbackButton(column) &&
              column.callback_data === callbackData.premoderation.postButton(chatId, memeId)
            ) {
              const [_, channel] = column.text.split('@')
              return Markup.button.callback(i18n['ru'].button.memePosted(channel), ECallback.IGNORE)
            }
            return column
          }),
        ),
      })
    }
    await ctx.reply(
      `
${i18n['ru'].message.memePostedSuccessfully()}
${'username' in postedMeme.chat ? `https://t.me/${postedMeme.chat.username}/${postedMeme.message_id}` : ''}
`,
      replyToMeme,
    )
    await insertBotAction(db, {
      userId: ctx.from.id,
      action: 'meme_post',
      query: memeId,
      page: '',
      chatId,
    })
    await db.close()
    await logUserAction(ctx, {
      info: `Meme posted`,
      chatId,
      memeId,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === '400: Bad Request: need administrator rights in the channel chat'
    ) {
      await ctx.reply(i18n['ru'].message.adminRightForPost(), replyToMeme)
      return
    }
    await ctx.answerCbQuery()
    throw error
  }
}
