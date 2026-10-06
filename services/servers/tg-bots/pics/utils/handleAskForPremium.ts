import { Markup } from 'telegraf'
import { PREMIUM_REQUEST_URL } from '../../../../../constants'
import { getTranslation } from '../i18n'
import type { TTelegrafContext } from '../types'

export const handleAskForPremium = async (ctx: TTelegrafContext) => {
  await ctx.reply(getTranslation(ctx.from.language_code).message.askForPremium(), {
    reply_markup: {
      inline_keyboard: [
        [
          Markup.button.url(
            getTranslation(ctx.from.language_code).button.goToPremiumRequest(),
            PREMIUM_REQUEST_URL,
          ),
        ],
      ],
    },
  })
}
