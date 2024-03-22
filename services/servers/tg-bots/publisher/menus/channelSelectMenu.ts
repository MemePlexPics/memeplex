import { KeyboardButton, RegularMenu } from 'telegraf-menu'
import { TCurrentCtx } from '../types'
import { EState } from '../constants'
import { channelSettingsMenu, mainMenu } from '.'

export const channelSelectMenu = (ctx: TCurrentCtx) => {
  new RegularMenu<TCurrentCtx, string>({
    action: EState.CHANNEL_SELECT,
    message: 'Выберите канал',
    filters: ['first', 'second', 'third']
      .map(i => new KeyboardButton(`@${i}`, i))
      .concat([new KeyboardButton('В главное меню', EState.MAIN)]),
    replaceable: true,
    menuGetter: (menuCtx) => menuCtx.session.keyboardMenu,
    menuSetter: (menuCtx, menu) => (menuCtx.session.keyboardMenu = menu),
    onChange(changeCtx, state) {
      console.log(state)
      if (state === EState.MAIN) return mainMenu(changeCtx)
      ctx.session.state = state;
      channelSettingsMenu(changeCtx)
    }
  }).sendMenu(ctx)
}
