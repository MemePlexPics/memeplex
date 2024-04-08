import { Keyboard } from 'telegram-keyboard'
import { TState, TTelegrafContext } from '../types'
import { EState } from '../constants'

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
    const onTextOptions: Record<string, (ctx?: TTelegrafContext) => Promise<unknown> | unknown> = {}
    const buttons = (await state.menu()).map(buttonRow => buttonRow.map(button => {
      if (Array.isArray(button)) {
        const [text, callback] = button
        onTextOptions[text] = callback
        return text
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
    await ctx.reply('', Keyboard.make(buttons).reply())
  }
}
