import { mainState } from '.'
import { EState } from '../constants'
import { handleMemeSearchRequest } from '../handlers'
import { getTranslation } from '../i18n'
import type { TState } from '../types'
import { enterToState } from '../utils'

export const memeSearchState: TState = {
  stateName: EState.MEME_SEARCH,
  menu: async ctx => {
    return {
      text: getTranslation(ctx.from.language_code).message.memeSearch.menu(),
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
  onText: async (ctx, _text) => {
    await handleMemeSearchRequest(ctx)
  },
}
