import { Keyboard } from 'telegram-keyboard'
import { TState, TTelegrafContext } from '../types'
import { EState } from '../constants'
import { Promisable } from '../../../../../types'

export const enterToState = async <GStateName extends EState>(
  ctx: TTelegrafContext,
  state: TState<GStateName>,
) => {
  ctx.session.state = state.stateName
  if (state.inlineMenu) {
    const inlineMenu = await state.inlineMenu(ctx)
    const menu = await ctx.reply(inlineMenu.text, Keyboard.make(inlineMenu.buttons).inline())
    if (ctx.session.lastMenuId) {
      await ctx.deleteMessage(ctx.session.lastMenuId)
    }
    ctx.session.lastMenuId = menu.message_id
    const message = state.message?.(ctx)
    if (message) await ctx.reply(message)
  }
  if (state.menu) {
    const onTextOptions: Record<string, (ctx?: TTelegrafContext) => Promisable<unknown>> = {}
    const { text: menuText, buttons: buttonsRaw } = await state.menu(ctx)
    const buttons = buttonsRaw.map(buttonRow => buttonRow.map(button => {
      if (Array.isArray(button)) {
        const [buttonText, callback] = button
        onTextOptions[buttonText] = callback
        return buttonText
      }
      return button
    }))
    state.onText = async (ctx, text) => {
      if (onTextOptions[text]) {
        await onTextOptions[text](ctx)
        return
      }
      await state.onText(ctx, text)
    }
    await ctx.reply(menuText, Keyboard.make(buttons).reply())
  }
}
