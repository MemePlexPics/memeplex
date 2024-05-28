import { Markup } from 'telegraf'
import process from 'process'
import 'dotenv/config'

import { TG_BOT_PAGE_SIZE } from '../../../../../constants'
import { getDbConnection } from '../../../../../utils'
import { getLatestMemes } from '../../../utils'
import { getBotAnswerString, getTelegramUser } from '../../utils'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'
import { insertBotAction, upsertBotUser } from '../../../../../utils/mysql-queries'

export const onBotCommandGetLatest = async (ctx: TTelegrafContext, isUpdate: boolean) => {
  if (!ctx.from) {
    throw new Error('There is no ctx.from')
  }
  if (!ctx.session.latest) {
    ctx.session.latest = {
      from: undefined,
      to: undefined,
    }
  }
  const { from: sessionFrom, to: sessionTo } = ctx.session.latest
  const from = isUpdate ? sessionTo : undefined
  const to = isUpdate ? undefined : sessionFrom
  const db = await getDbConnection()
  const { id, user } = getTelegramUser(ctx.from)

  await upsertBotUser(db, {
    id,
    user,
  })
  await insertBotAction(db, {
    userId: id,
    action: 'latest',
    query: null,
    page: [from, to].join(','),
  })
  await db.close()
  const response = await getLatestMemes(ctx.elastic, from, to, TG_BOT_PAGE_SIZE)

  for (const meme of response.result) {
    await ctx.reply(getBotAnswerString(meme), {
      parse_mode: 'Markdown',
      link_preview_options: {
        url: new URL(`https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme.fileName}`).href,
      },
    })
  }

  if (!sessionFrom || (response.from && response.from < sessionFrom))
    ctx.session.latest.from = response.from
  if (!sessionTo || (response.to && response.to > sessionTo)) ctx.session.latest.to = response.to

  const isLastNewPage = isUpdate && response.totalPages === 0
  const finalReplyText = isLastNewPage
    ? i18n['ru'].message.noNewMemes()
    : `${response.totalPages - 1} more ${isUpdate ? 'new pages' : 'pages in the past'}`
  const buttons = Markup.inlineKeyboard([
    Markup.button.callback(i18n['ru'].button.load.newer(), 'button_latest_newer'),
    Markup.button.callback(i18n['ru'].button.load.older(), 'button_latest_older'),
  ])
  await ctx.reply(finalReplyText, buttons)
}
