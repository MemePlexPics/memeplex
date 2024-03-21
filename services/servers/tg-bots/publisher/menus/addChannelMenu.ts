import { KeyboardButton, RegularMenu } from 'telegraf-menu'
import { TCurrentCtx } from '../types'
import { EState } from '../constants'
import { mainMenu } from '.'

export const addChannelMenu = (ctx: TCurrentCtx) => {
  ctx.session.channel = EState.ADD_CHANNEL
  new RegularMenu<TCurrentCtx, EState>({
    action: EState.ADD_CHANNEL,
    message:
      'Отправьте мне ссылку на ваш канал в формате @your_channel или https://t.me/your_channel',
    filters: [new KeyboardButton('Назад', EState.MAIN)],
    replaceable: true,
    menuGetter: (menuCtx) => menuCtx.session.keyboardMenu,
    menuSetter: (menuCtx, menu) => (menuCtx.session.keyboardMenu = menu),
    onChange(changeCtx, state) {
      console.log(state)
      if (state === EState.MAIN) return mainMenu(changeCtx)
    }
  }).sendMenu(ctx)
}
