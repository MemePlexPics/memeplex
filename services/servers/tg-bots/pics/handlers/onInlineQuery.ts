import process from 'process'

import { TG_INLINE_BOT_PAGE_SIZE } from '../../../../../constants'
import { getLatestInlineSelectedMemes, searchMemes } from '../../../utils'
import { logUserAction } from '../utils'

export const onInlineQuery = async (ctx, page, client, sessionInline, logger) => {
  const query = ctx.inlineQuery.query

  await logUserAction(
    ctx.inlineQuery.from,
    {
      inline_search: {
        query,
        page,
        chat_type: ctx.inlineQuery.chat_type,
      },
    },
    logger,
  )
  if (sessionInline[ctx.inlineQuery.from.id].abortController) {
    sessionInline[ctx.inlineQuery.from.id].abortController.abort()
  }
  const abortController = new AbortController()
  sessionInline[ctx.inlineQuery.from.id].abortController = abortController

  const response = query
    ? await searchMemes(client, query, page, TG_INLINE_BOT_PAGE_SIZE, abortController)
    : {
      result: await getLatestInlineSelectedMemes(client, abortController),
      totalPages: 1,
    }

  const results = response.result.map(meme => {
    const photo_url = new URL(`https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme.fileName}`)
      .href
    return {
      type: 'photo',
      id: meme.id,
      photo_url,
      thumb_url: photo_url,
      // caption: meme.text.eng.substring(0, 1024),
      photo_width: 400,
      photo_height: 400,
    }
  })

  // If they are not equal, then there is at least one more new request from the same user
  if (abortController === sessionInline[ctx.inlineQuery.from.id].abortController) {
    if (results.length) {
      await ctx.answerInlineQuery(results, {
        next_offset: response.totalPages - page > 0 ? page + 1 + '' : '',
      })
    } else {
      await ctx.answerInlineQuery([
        {
          type: 'article',
          id: query,
          title: 'Ничего не найдено',
          input_message_content: {
            message_text: 'Ничего не найдено',
          },
        },
      ])
    }
    sessionInline[ctx.inlineQuery.from.id].debounce = 0
    sessionInline[ctx.inlineQuery.from.id].abortController = undefined
  }
}
