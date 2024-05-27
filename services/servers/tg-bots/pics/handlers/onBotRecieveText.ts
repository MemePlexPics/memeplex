import process from 'process'
import 'dotenv/config'
import { Markup } from 'telegraf'

import { MAX_SEARCH_QUERY_LENGTH, TG_BOT_PAGE_SIZE } from '../../../../../constants'
import { logError } from '../../../../../utils'
import { searchMemes } from '../../../utils/searchMemes'
import { logUserAction, resetSearchSession } from '../utils'
import { getBotAnswerString } from '../../utils'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'
import type { Client } from '@elastic/elasticsearch'
import type { Logger } from 'winston'

export const onBotRecieveText = async (ctx: TTelegrafContext, client: Client, logger: Logger) => {
  try {
    const query =
      ctx.session.search.query ||
      ('message' in ctx.update &&
        'text' in ctx.update.message &&
        ctx.update.message.text.slice(0, MAX_SEARCH_QUERY_LENGTH).replace(/[@]?MemePlexBot/i, ''))
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
        `Page ${page} of ${response.totalPages}`,
        Markup.inlineKeyboard([
          Markup.button.callback(i18n['ru'].button.loadMore(), 'button_search_more'),
        ]),
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
    await ctx.reply(i18n['ru'].message.error())
  }
}
