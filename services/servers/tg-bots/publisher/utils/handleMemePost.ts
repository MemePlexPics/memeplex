import fs from 'fs/promises'
import { TTelegrafContext } from '../types'
import { getMeme } from '../../../utils'
import { Client } from '@elastic/elasticsearch'
import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import { updatePublisherChannelById } from '../../../../../utils/mysql-queries'
import { i18n } from '../i18n'

export const handleMemePost = async (
  client: Client,
  ctx: TTelegrafContext,
  chatId: number,
  memeId: string,
) => {
  const meme = await getMeme(client, memeId)
  const replyParameters = {
    message_id: ctx.callbackQuery.message.message_id,
  }
  try {
    await ctx.telegram.sendPhoto(chatId, {
      source: await fs.readFile(meme.fileName),
    })
    await ctx.reply(i18n['ru'].message.memePostedSuccessfully, {
      reply_parameters: replyParameters,
    })
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
      await ctx.reply(i18n['ru'].message.adminRightForPost, {
        reply_parameters: replyParameters,
      })
      return
    }
    await ctx.answerCbQuery()
    throw error
  }
}
