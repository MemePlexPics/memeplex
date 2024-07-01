import process from 'process'
import 'dotenv/config'

import { TG_INLINE_BOT_PAGE_SIZE } from '../../../../../constants'
import { getLatestInlineSelectedMemes, searchMemes } from '../../../utils'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'
import { getDbConnection } from '../../../../../utils'
import { insertBotInlineAction, upsertBotInlineUser } from '../../../../../utils/mysql-queries'
import { getTelegramUser } from '../../utils'
import type { Update } from 'telegraf/typings/core/types/typegram'
import { logUserAction } from '../utils'

// TODO: -> handleInlineQuery
export const onInlineQuery = async (
  ctx: TTelegrafContext<Update.InlineQueryUpdate>,
  page: number,
) => {
  const query = ctx.inlineQuery.query

  const db = await getDbConnection()
  const { id, user } = getTelegramUser(ctx.from)
  await upsertBotInlineUser(db, {
    id,
    user,
  })
  await insertBotInlineAction(db, {
    userId: ctx.from.id,
    action: 'search',
    query: query,
    selectedId: null,
    page: page + '',
    chatType: ctx.inlineQuery.chat_type,
  })
  await db.close()
  await logUserAction(ctx, {
    action: 'inline_search',
    query: query,
    page: page,
    chatType: ctx.inlineQuery.chat_type || '',
  })

  const oldAbortController = ctx.sessionInMemory.abortController
  if (oldAbortController) {
    oldAbortController.abort()
  }
  const abortController = new AbortController()
  ctx.sessionInMemory.abortController = abortController

  const response = query
    ? await searchMemes(ctx.elastic, query, page, TG_INLINE_BOT_PAGE_SIZE, abortController)
    : {
      result: await getLatestInlineSelectedMemes(ctx.elastic, abortController),
      totalPages: 1,
    }

  const results = response.result.map(meme => {
    const photo_url = new URL(`https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme!.fileName}`)
      .href
    return {
      type: 'photo' as const,
      id: meme!.id,
      photo_url,
      thumbnail_url: photo_url,
      // caption: meme.text.eng.substring(0, 1024),
      photo_width: 400,
      photo_height: 400,
    }
  })

  // If they are not equal, then there is at least one more new request from the same user
  if (abortController === ctx.sessionInMemory.abortController) {
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
    ctx.sessionInMemory.debounce = undefined
    ctx.sessionInMemory.abortController = undefined
  }
}
