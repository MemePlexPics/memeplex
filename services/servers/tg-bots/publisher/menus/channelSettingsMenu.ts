import { KeyboardButton, RegularMenu } from 'telegraf-menu'
import { TCurrentCtx } from '../types'
import { EState } from '../constants'
import { mainMenu } from '.'

export const channelSettingsMenu = (ctx: TCurrentCtx) => {
  new RegularMenu<TCurrentCtx, EState>({
    action: EState.CHANNEL_SETTINGS,
    message: 'Настройки каналов',
    filters: [
      new KeyboardButton('Добавить ключевые слова', EState.ADD_KEYWORDS),
      new KeyboardButton(
        'Редактировать ключевые слова',
        EState.KEYWORD_SETTINGS
      ),
      new KeyboardButton('Назад', EState.MAIN),
    ],
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
