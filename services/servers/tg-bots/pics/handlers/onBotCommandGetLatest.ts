import { Markup } from 'telegraf'
import process from 'process'

import { TG_BOT_PAGE_SIZE } from '../../../../../constants'
import { logError } from '../../../../../utils'
import { getLatestMemes } from '../../../utils'
import { logUserAction } from '../utils'
import { getBotAnswerString } from '../../utils'
import { i18n } from '../i18n'

export const onBotCommandGetLatest = async (ctx, isUpdate, client, logger) => {
  try {
    const { from: sessionFrom, to: sessionTo } = ctx.session.latest
    const from = isUpdate ? sessionTo : undefined
    const to = isUpdate ? undefined : sessionFrom
    logUserAction(
      ctx.from,
      {
        latest: {
          from,
          to,
        },
      },
      logger,
    )
    const response = await getLatestMemes(client, from, to, TG_BOT_PAGE_SIZE)

    for (const meme of response.result) {
      await ctx.reply(getBotAnswerString(meme), {
        parse_mode: 'markdown',
        link_preview_options: {
          url: new URL(`https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/${meme.fileName}`).href,
        },
      })
    }

    if (!sessionFrom || response.from < sessionFrom) ctx.session.latest.from = response.from
    if (!sessionTo || response.to > sessionTo) ctx.session.latest.to = response.to

    const isLastNewPage = isUpdate && response.totalPages === 0
    const finalReplyText = isLastNewPage
      ? i18n['ru'].message.noNewMemes
      : `${response.totalPages - 1} more ${isUpdate ? 'new pages' : 'pages in the past'}`
    const buttons = Markup.inlineKeyboard([
      Markup.button.callback(i18n['ru'].button.loadNewer, 'button_latest_newer'),
      Markup.button.callback(i18n['ru'].button.loadOlder, 'button_latest_older'),
    ])
    await ctx.reply(finalReplyText, buttons)
  } catch (e) {
    await logError(logger, e)
    await ctx.reply(i18n['ru'].message.error)
  }
}
