import { Markup } from 'telegraf'
import { PREMIUM_REQUEST_URL } from '../../../../../constants'
import { i18n } from '../i18n'
import type { TTelegrafContext } from '../types'

export const handleAskForPremium = async (ctx: TTelegrafContext) => {
  await ctx.reply(i18n['ru'].message.askForPremium(), {
    reply_markup: {
      inline_keyboard: [
        [Markup.button.url(i18n['ru'].button.goToPremiumRequest(), PREMIUM_REQUEST_URL)],
      ],
    },
  })
}
