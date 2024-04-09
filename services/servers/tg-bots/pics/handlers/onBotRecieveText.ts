import process from 'process'
import { Markup } from 'telegraf'

import { MAX_SEARCH_QUERY_LENGTH, TG_BOT_PAGE_SIZE } from '../../../../../constants'
import { logError } from '../../../../../utils'
import { searchMemes } from '../../../utils/searchMemes'
import { getBotAnswerString, logUserAction, resetSearchSession } from '../utils'

export const onBotRecieveText = async (ctx, client, logger) => {
  try {
    const query =
      ctx.session.search.query || ctx.update.message.text.slice(0, MAX_SEARCH_QUERY_LENGTH)
    const page = ctx.session.search.nextPage || 1
    await logUserAction(
      ctx.from,
      {
        search: {
          query,
          page,
        },
      },
      logger,
    )
    const response = await searchMemes(client, query, page, TG_BOT_PAGE_SIZE)

    if (response.totalPages === 0) {
      await ctx.reply('Nothing found')
      return
    }
    for (const meme of response.result) {
      await ctx.reply(getBotAnswerString(meme), {
        parse_mode: 'markdown',
        link_preview_options: {
          url: new URL(`https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme.fileName}`).href,
        },
      })
    }
    if (page < response.totalPages) {
      await ctx.reply(
        `Page ${page} of ${response.totalPages}`,
        Markup.inlineKeyboard([Markup.button.callback('Load more', 'button_search_more')]),
      )
      ctx.session.search = {
        nextPage: page + 1,
        query: query,
      }
      return
    }
    resetSearchSession(ctx)
  } catch (e) {
    await logError(logger, e)
    await ctx.reply('An error occurred, please try again later')
  }
}
