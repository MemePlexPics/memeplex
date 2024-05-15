import { mainState } from '.'
import { EState } from '../constants'
import { i18n } from '../i18n'
import { TState } from '../types'
import { addChannel, enterToState } from '../utils'

export const addChannelState: TState = {
  stateName: EState.ADD_CHANNEL,
  menu: async () => {
    return {
      text: i18n['ru'].message.enterChannelNameInFormat(),
      buttons: [[[i18n['ru'].button.back(), ctx => enterToState(ctx, mainState)]]],
    }
  },
  onText: async (ctx, text) => {
    await addChannel(ctx, text)
  },
  onCallback: async (ctx, text) => {
    await addChannel(ctx, text)
  },
}
