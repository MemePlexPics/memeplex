import { enterToState } from '.'
import { ECallback } from '../constants'
import { i18n } from '../i18n'
import type { TState, TTelegrafContext } from '../types'

export const handlePaywall = async (
  ctx: TTelegrafContext,
  paywallText: string,
  fallbackState?: TState,
) => {
  if (await ctx.hasPremiumSubscription) {
    if (fallbackState) {
      await enterToState(ctx, fallbackState)
    }
    await ctx.reply(paywallText, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: i18n['ru'].button.subscribeToPremium(),
              callback_data: ECallback.PAY,
            },
          ],
        ],
      },
    })
    return false
  }
  return true
}
