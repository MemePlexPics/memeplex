import type { TState, TTelegrafContext } from '../types'
import { getMenuButtonsAndHandlers } from '.'
import { Markup } from 'telegraf'

export const enterToState = async (ctx: TTelegrafContext, state: TState) => {
  if (state.beforeInit) {
    const isInit = await state.beforeInit(ctx)
    if (!isInit) return
  }
  ctx.session.state = state.stateName
  if (state.message) {
    const message = await state.message?.(ctx)
    if (message) await ctx.reply(message)
  }
  // TODO: split message text by 4 KiB (4096)
  if (state.menu) {
    const { text: menuText, buttons } = await getMenuButtonsAndHandlers(ctx, state)
    await ctx.reply(menuText, Markup.keyboard(buttons).resize())
  }
  if (state.inlineMenu) {
    const inlineMenu = await state.inlineMenu(ctx)
    // await ctx.deleteMessage()
    if (inlineMenu) {
      await ctx.reply(inlineMenu.text, Markup.inlineKeyboard(inlineMenu.buttons))
    }
  }
}
