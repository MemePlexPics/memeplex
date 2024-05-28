import { mainState } from '.'
import { EState } from '../constants'
import { handleMemeSearchRequest } from '../handlers'
import { i18n } from '../i18n'
import type { TState } from '../types'
import { enterToState } from '../utils'

export const memeSearchState: TState = {
  stateName: EState.MEME_SEARCH,
  menu: async () => {
    return {
      text: i18n['ru'].message.memeSearch.menu(),
      buttons: [[[i18n['ru'].button.back(), ctx => enterToState(ctx, mainState)]]],
    }
  },
  onText: async (ctx, _text) => {
    await handleMemeSearchRequest(ctx)
  },
}
