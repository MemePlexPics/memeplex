import { Markup } from 'telegraf'
import process from 'process'

import { TG_BOT_PAGE_SIZE } from '../../../../../constants'
import { logError } from '../../../../../utils'
import { getLatestMemes } from '../../../utils'
import { logUserAction } from '../utils'
import { getBotAnswerString } from '../../utils'

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
      ? 'There are no new memes since last request'
      : `${response.totalPages - 1} more ${isUpdate ? 'new pages' : 'pages in the past'}`
    const buttons = Markup.inlineKeyboard([
      Markup.button.callback('Load newer', 'button_latest_newer'),
      Markup.button.callback('Load older', 'button_latest_older'),
    ])
    await ctx.reply(finalReplyText, buttons)
  } catch (e) {
    await logError(logger, e)
    await ctx.reply('An error occurred, please try again later')
  }
}
