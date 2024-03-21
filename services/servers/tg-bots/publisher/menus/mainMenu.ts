import { KeyboardButton, RegularMenu } from 'telegraf-menu'
import { TCurrentCtx } from '../types'
import { EState } from '../constants'
import { addChannelMenu, channelSelectMenu } from '.'

export const mainMenu = (ctx: TCurrentCtx) => {
  new RegularMenu<TCurrentCtx, EState>({
    action: EState.MAIN,
    message: 'Здесь вы можете управлять вашими каналами',
    filters: [
      new KeyboardButton('Добавить канал', EState.ADD_CHANNEL),
      new KeyboardButton('Настройки каналов', EState.CHANNEL_SELECT)
    ],
    replaceable: true,
    menuGetter: (menuCtx) => menuCtx.session.keyboardMenu,
    menuSetter: (menuCtx, menu) => (menuCtx.session.keyboardMenu = menu),
    onChange(changeCtx, state) {
      ctx.session.state = state
      console.log(state)
      switch (state) {
        case EState.ADD_CHANNEL:
          return addChannelMenu(changeCtx)
        case EState.CHANNEL_SELECT:
          return channelSelectMenu(changeCtx)
      }
    }
  }).sendMenu(ctx)
}
