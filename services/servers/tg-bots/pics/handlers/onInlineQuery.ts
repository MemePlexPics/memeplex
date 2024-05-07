import process from 'process'
import 'dotenv/config'

import { TG_INLINE_BOT_PAGE_SIZE } from '../../../../../constants'
import { getLatestInlineSelectedMemes, searchMemes } from '../../../utils'
import { logUserAction } from '../utils'
import { i18n } from '../i18n'
import { TSessionInMemory, TTelegrafContext } from '../types'
import { Client } from '@elastic/elasticsearch'
import { Logger } from 'winston'

export const onInlineQuery = async (
  ctx: TTelegrafContext,
  page: number,
  client: Client,
  sessionInMemory: TSessionInMemory,
  logger: Logger,
) => {
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
  if (sessionInMemory[ctx.inlineQuery.from.id].abortController) {
    sessionInMemory[ctx.inlineQuery.from.id].abortController.abort()
  }
  const abortController = new AbortController()
  sessionInMemory[ctx.inlineQuery.from.id].abortController = abortController

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
      type: 'photo' as const,
      id: meme.id,
      photo_url,
      thumbnail_url: photo_url,
      // caption: meme.text.eng.substring(0, 1024),
      photo_width: 400,
      photo_height: 400,
    }
  })

  // If they are not equal, then there is at least one more new request from the same user
  if (abortController === sessionInMemory[ctx.inlineQuery.from.id].abortController) {
    if (results.length) {
      await ctx.answerInlineQuery(results, {
        next_offset: response.totalPages - page > 0 ? page + 1 + '' : '',
      })
    } else {
      await ctx.answerInlineQuery([
        {
          type: 'article',
          id: query,
          title: i18n['ru'].message.nothingFound(),
          input_message_content: {
            message_text: i18n['ru'].message.nothingFound(),
          },
        },
      ])
    }
    sessionInMemory[ctx.inlineQuery.from.id].debounce = undefined
    sessionInMemory[ctx.inlineQuery.from.id].abortController = undefined
  }
}
