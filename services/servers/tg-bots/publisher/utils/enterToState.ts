import { Keyboard } from 'telegram-keyboard'
import { TState, TTelegrafContext } from '../types'
import { EState } from '../constants'
import { getMenuButtonsAndHandlers } from '.'

export const enterToState = async <GStateName extends EState>(
  ctx: TTelegrafContext,
  state: TState<GStateName>,
) => {
  if (state.beforeInit) {
    const isInit = await state.beforeInit(ctx)
    if (!isInit) return
  }
  ctx.session.state = state.stateName
  // TODO: split message text by 4 KiB (4096)
  if (state.menu) {
    const { text: menuText, buttons } = await getMenuButtonsAndHandlers(ctx, state)
    await ctx.reply(menuText, Keyboard.make(buttons).reply())
  }
  if (state.inlineMenu) {
    const inlineMenu = await state.inlineMenu(ctx)
    const menu = await ctx.reply(inlineMenu.text, Keyboard.make(inlineMenu.buttons).inline())
    ctx.session.lastMenuId = menu.message_id
  }
  if (state.message) {
    const message = await state.message?.(ctx)
    if (message) await ctx.reply(message)
  }
}
