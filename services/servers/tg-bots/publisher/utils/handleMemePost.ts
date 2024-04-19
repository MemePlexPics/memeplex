import fs from 'fs/promises'
import { TTelegrafContext } from '../types'
import { getMeme } from '../../../utils'
import { Client } from '@elastic/elasticsearch'
import { logUserAction } from '.'

export const handleMemePost = async (
  client: Client,
  ctx: TTelegrafContext,
  chatId: string | number,
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
}
