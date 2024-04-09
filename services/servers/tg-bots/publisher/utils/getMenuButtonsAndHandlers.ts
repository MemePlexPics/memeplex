import { Promisable } from "../../../../../types"
import { TState, TTelegrafContext } from "../types"

export const getMenuButtonsAndHandlers = async (ctx: TTelegrafContext, state: TState) => {
  const onTextHandlers: Record<string, (ctx?: TTelegrafContext, text?: string) => Promisable<unknown>> = {}
  const { text, buttons: buttonsRaw } = await state.menu(ctx)
  const buttons = buttonsRaw.map(buttonRow => buttonRow.map(button => {
    if (Array.isArray(button)) {
      const [buttonText, callback] = button
      onTextHandlers[buttonText] = callback
      return buttonText
    }
    return button
  }))

  return {
    text,
    buttons,
    onTextHandlers,
  }
}
