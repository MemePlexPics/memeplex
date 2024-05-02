import { enterToState } from '.'
import { TDbConnection } from '../../../../../utils/types'
import { getPublisherUserTariffPlan } from '../../../../utils'
import { ECallback } from '../constants'
import { i18n } from '../i18n'
import { TState, TTelegrafContext } from '../types'

export const handlePaywall = async (
  db: TDbConnection,
  ctx: TTelegrafContext,
  fallbackState?: TState,
) => {
  const userTariff = await getPublisherUserTariffPlan(db, ctx.from.id)
  if (userTariff === 'free') {
    if (fallbackState) {
      await enterToState(ctx, fallbackState)
    }
    await ctx.reply(i18n['ru'].message.freeTariff(), {
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
