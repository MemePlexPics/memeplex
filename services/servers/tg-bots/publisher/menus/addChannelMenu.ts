import { KeyboardButton, RegularMenu } from 'telegraf-menu'
import { TCurrentCtx } from '../types'
import { EState } from '../constants'
import { mainMenu } from '.'

export const addChannelMenu = (ctx: TCurrentCtx) => {
  new RegularMenu<TCurrentCtx, EState>({
    action: EState.ADD_CHANNEL,
    message:
      'Отправьте мне ссылку на ваш канал в формате @channel или https://t.me/channel',
    filters: [new KeyboardButton('Назад', EState.MAIN)],
    replaceable: true,
    menuGetter: (menuCtx) => menuCtx.session.keyboardMenu,
    menuSetter: (menuCtx, menu) => (menuCtx.session.keyboardMenu = menu),
    onChange(changeCtx, state) {
      switch (state) {
        case EState.MAIN:
          return mainMenu(changeCtx)
      }
    }
  }).sendMenu(ctx)
}
