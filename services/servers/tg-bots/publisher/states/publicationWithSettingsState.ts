import { EState } from '../constants'
import { TState } from '../types'

export const publicationWithSettingsState: TState = {
  stateName: EState.PUBLICATION_WITH_SETTINGS,
  menu: async () => {
    return {
      text: '',
      buttons: [],
    }
  },
  onText: async (ctx, text) => {},
}
