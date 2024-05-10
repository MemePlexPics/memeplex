import { Promisable, RequiredProperty } from '../../../../../types'
import { TState, TTelegrafContext } from '../types'

export const getMenuButtonsAndHandlers = async (
  ctx: TTelegrafContext,
  state: RequiredProperty<TState, 'menu'>,
) => {
  const onTextHandlers: Record<
  string,
  (ctx: TTelegrafContext, text: string) => Promisable<unknown>
  > = {}
  if (!state.menu) throw new Error()
  const { text, buttons: buttonRaws } = await state.menu(ctx)
  const buttons = buttonRaws.map(buttonRow =>
    buttonRow.map(button => {
      if (Array.isArray(button)) {
        const [text, callback] = button
        onTextHandlers[text] = callback
        return text
      }
      return button
    }),
  )

  return {
    text,
    buttons,
    onTextHandlers,
  }
}
