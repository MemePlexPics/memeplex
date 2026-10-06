import { mainState } from '.'
import { EState } from '../constants'
import { getTranslation } from '../i18n'
import type { TState } from '../types'
import { addChannel, enterToState } from '../utils'

export const addChannelState: TState = {
  stateName: EState.ADD_CHANNEL,
  menu: async ctx => {
    return {
      text: getTranslation(ctx.from.language_code).message.enterChannelNameInFormat(),
      buttons: [
        [
          [
            getTranslation(ctx.from.language_code).button.back(),
            ctx => enterToState(ctx, mainState),
          ],
        ],
      ],
    }
  },
  onText: async (ctx, text) => {
    await addChannel(ctx, text)
  },
  onCallback: async (ctx, text) => {
    await addChannel(ctx, text)
  },
}
