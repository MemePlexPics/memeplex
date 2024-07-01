import process from 'process'
import 'dotenv/config'
import { Markup } from 'telegraf'

import { TG_BOT_PAGE_SIZE } from '../../../../../constants'
import { getDbConnection } from '../../../../../utils'
import { searchMemes } from '../../../utils/searchMemes'
import { getBotAnswerString, getTelegramUser } from '../../utils'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'
import { insertBotAction, upsertBotUser } from '../../../../../utils/mysql-queries'
import { ECallback } from '../constants'
import { logUserAction } from '../utils'

export const onBotRecieveText = async (ctx: TTelegrafContext, query: string) => {
  const page = ctx.session.search.nextPage || 1
  const db = await getDbConnection()
  const { id, user } = getTelegramUser(ctx.from)

  await upsertBotUser(db, {
    id,
    user,
  })
  await insertBotAction(db, {
    userId: id,
    action: 'search',
    query: 'search',
    page: page + '',
  })
  await db.close()
  await logUserAction(ctx, {
    action: 'search',
    query: query,
    page: page,
  })
  const response = await searchMemes(ctx.elastic, query, page, TG_BOT_PAGE_SIZE)

  if (response.totalPages === 0) {
    await ctx.reply(i18n['ru'].message.nothingFound())
    return
  }
  for (const meme of response.result) {
    await ctx.reply(getBotAnswerString(meme), {
      parse_mode: 'Markdown',
      link_preview_options: {
        url: new URL(`https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme.fileName}`).href,
      },
    })
  }
  if (page < response.totalPages) {
    await ctx.reply(
      i18n['ru'].message.memeSearch.pageXOfN(page, response.totalPages),
      Markup.inlineKeyboard([
        Markup.button.callback(i18n['ru'].button.load.more(), ECallback.SEARCH_NEXT_PAGE),
      ]),
    )
    ctx.session.search = {
      nextPage: page + 1,
      query: query,
    }
    return
  }
  ctx.session.search = {
    nextPage: null,
    query: null,
  }
}
