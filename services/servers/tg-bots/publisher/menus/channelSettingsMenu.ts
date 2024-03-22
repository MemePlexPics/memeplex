import { KeyboardButton, RegularMenu } from 'telegraf-menu'
import { TCurrentCtx } from '../types'
import { EState } from '../constants'
import { keywordSettingsMenu, mainMenu } from '.'

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
      console.log(state)
      ctx.session.state = state
      if (state === EState.MAIN) {
        changeCtx.session.channel = undefined
        return mainMenu(changeCtx)
      }
      if (state === EState.ADD_KEYWORDS) {
        return ctx.reply('Отправьте ссылку на канал в формате @name или https://t.me/name')
      }
      if (state === EState.KEYWORD_SETTINGS) {
        return keywordSettingsMenu(changeCtx)
      }
    }
  }).sendMenu(ctx)
}
