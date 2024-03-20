import { KeyboardButton, RadioMenu, RegularMenu } from 'telegraf-menu'
import { TCurrentCtx } from '../types'
import { EState } from '../constants'
import { channelSettingsMenu } from '.'

export const channelSelectMenu = (ctx: TCurrentCtx) => {
  new RadioMenu<TCurrentCtx, string>({
    action: EState.CHANNEL_SELECT,
    message: 'Выберите канал',
    filters: [1,2,3].map(i => new KeyboardButton(`@channel_${i}`, 'i')),
    replaceable: true,
    menuGetter: (menuCtx) => menuCtx.session.keyboardMenu,
    menuSetter: (menuCtx, menu) => (menuCtx.session.keyboardMenu = menu),
    onChange(changeCtx, state) {
      channelSettingsMenu(changeCtx)
      // switch (state) {
      //   case EState.MAIN:
      //     return mainMenu(changeCtx)
      // }
    }
  }).sendMenu(ctx)
}
