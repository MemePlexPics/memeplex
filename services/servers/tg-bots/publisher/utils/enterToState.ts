import { Keyboard } from 'telegram-keyboard'
import { TState, TTelegrafContext } from '../types'
import { EState } from '../constants'
import { Promisable } from '../../../../../types'

export const enterToState = async <GStateName extends EState>(
  ctx: TTelegrafContext,
  state: TState<GStateName>,
) => {
  const stateNew = await state(ctx)
  ctx.sessionInMemory = stateNew
  ctx.session.state = stateNew.stateName
  if (stateNew.menu) {
    const onTextOptions: Record<string, (ctx?: TTelegrafContext) => Promisable<unknown>> = {}
    const { text: menuText, buttons: buttonsRaw } = await stateNew.menu(ctx)
    const buttons = buttonsRaw.map(buttonRow => buttonRow.map(button => {
      if (Array.isArray(button)) {
        const [buttonText, callback] = button
        onTextOptions[buttonText] = callback
        return buttonText
      }
      return button
    }))
    ctx.sessionInMemory.onText = async (ctx, text) => {
      if (onTextOptions[text]) {
        await onTextOptions[text](ctx)
        return
      }
      if (stateNew.onText) {
        await stateNew.onText(ctx, text)
      }
    }
    await ctx.reply(menuText, Keyboard.make(buttons).reply())
  }
  if (stateNew.inlineMenu) {
    const inlineMenu = await stateNew.inlineMenu(ctx)
    // @ts-expect-error remove_keyboard bullshit, questinable type unition
    const menu = await ctx.reply(inlineMenu.text, new Keyboard([], {
      one_time_keyboard: true,
    }).make(inlineMenu.buttons).inline())
    // if (ctx.session.lastMenuId) {
    //   await ctx.deleteMessage(ctx.session.lastMenuId)
    // }
    // ctx.session.lastMenuId = menu.message_id
  }
  if (stateNew.message) {
    const message = stateNew.message?.(ctx)
    if (message) await ctx.reply(message)
  }
}
