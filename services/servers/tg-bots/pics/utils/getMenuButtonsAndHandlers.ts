import { resolveLanguage } from '../i18n'
import type { Message, Update } from 'telegraf/typings/core/types/typegram'
import type { Promisable, RequiredProperty } from '../../../../../types'
import type { TState, TTelegrafContext } from '../types'

export const getMenuButtonsAndHandlers = async (
  ctx: TTelegrafContext,
  state: RequiredProperty<TState, 'menu'>,
) => {
  const onTextHandlers: Record<
    string,
    (
      ctx: TTelegrafContext<Update.MessageUpdate<Message.TextMessage>>,
      text: string,
    ) => Promisable<unknown>
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

// A reply keyboard may still contain labels from before the user changed
// Telegram's interface language. Recognize those labels without translating
// search queries or changing callback identifiers.
export const getMenuTextHandler = async (
  ctx: TTelegrafContext,
  state: RequiredProperty<TState, 'menu'>,
  text: string,
) => {
  const current = await getMenuButtonsAndHandlers(ctx, state)
  if (current.onTextHandlers[text]) return current.onTextHandlers[text]
  const languageCode = ctx.from.language_code
  try {
    ctx.from.language_code = resolveLanguage(languageCode) === 'ru' ? 'en' : 'ru'
    const previous = await getMenuButtonsAndHandlers(ctx, state)
    return previous.onTextHandlers[text]
  } finally {
    ctx.from.language_code = languageCode
  }
}
