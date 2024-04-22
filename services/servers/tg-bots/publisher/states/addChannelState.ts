import { mainState } from '.'
import { EState } from '../constants'
import { TState } from '../types'
import { addChannel, enterToState } from '../utils'

export const addChannelState: TState = {
  stateName: EState.ADD_CHANNEL,
  menu: async () => {
    return {
      text: 'Введитие название канала в формате @name или https://t.me/name',
      buttons: [[['⬅️ Назад', ctx => enterToState(ctx, mainState)]]],
    }
  },
  onText: async (ctx, text) => {
    await addChannel(ctx, text)
  },
  onCallback: async (ctx, text) => {
    await addChannel(ctx, text)
  },
}
