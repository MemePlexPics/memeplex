import { KeyboardButton, RegularMenu } from 'telegraf-menu'
import { TCurrentCtx } from '../types'
import { EState } from '../constants'
import { mainMenu } from '.'

export const keywordSettingsMenu = (ctx: TCurrentCtx) => {
  new RegularMenu<TCurrentCtx, string>({
    action: EState.KEYWORD_SETTINGS,
    message: 'Настройка ключевых слов',
    filters: ['tits','peaches'].map(k => (
      new KeyboardButton(`✏️ «${k}»`, k)
      // new KeyboardButton('🗑', `${k}|del`)
    )).concat([new KeyboardButton('В главное меню', EState.MAIN)]),
    replaceable: true,
    menuGetter: (menuCtx) => menuCtx.session.keyboardMenu,
    menuSetter: (menuCtx, menu) => (menuCtx.session.keyboardMenu = menu),
    onChange(changeCtx, state) {
      console.log(state)
      ctx.session.state = state
      if (state === EState.MAIN) {
        changeCtx.session.channel = undefined
        return mainMenu(changeCtx)
      }
    }
  }).sendMenu(ctx)
}
