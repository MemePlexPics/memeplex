import fs from 'fs/promises'
import { TTelegrafContext } from '../types'
import { getMeme } from '../../../utils'
import { Client } from '@elastic/elasticsearch'
import { logUserAction } from '.'
import { getDbConnection } from '../../../../../utils'
import { updatePublisherChannelById } from '../../../../../utils/mysql-queries'

export const handleMemePost = async (
  client: Client,
  ctx: TTelegrafContext,
  chatId: number,
  memeId: string,
) => {
  const meme = await getMeme(client, memeId)
  await ctx.telegram.sendPhoto(chatId, {
    source: await fs.readFile(meme.fileName),
  })
  await ctx.reply(`Мем успешно опубликован.`)
  logUserAction(ctx.from, {
    info: `Meme posted`,
    chatId,
    memeId,
  })
  const subscribers = await ctx.telegram.getChatMembersCount(chatId)
  const db = await getDbConnection()
  await updatePublisherChannelById(db, { subscribers }, chatId)
}
