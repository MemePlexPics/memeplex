jest.mock('../constants', () => ({ MAX_FREE_USER_CHANNEL_SUBS: 1000 }))

import { getTranslation, i18n, resolveLanguage } from '../services/servers/tg-bots/pics/i18n'
import { getMenuTextHandler } from '../services/servers/tg-bots/pics/utils/getMenuButtonsAndHandlers'
import type { TTelegrafContext, TState } from '../services/servers/tg-bots/pics/types'
import { EState } from '../services/servers/tg-bots/pics/constants'

const ctxFor = (language_code?: string) => ({ from: { language_code } }) as TTelegrafContext

describe('Telegram interface language', () => {
  test('uses supported interface languages and falls back to English', () => {
    for (const [input, expected] of [
      ['ru', 'ru'],
      ['ru-RU', 'ru'],
      ['en-US', 'en'],
      ['uk', 'en'],
      [undefined, 'en'],
    ] as const) {
      expect(resolveLanguage(input)).toBe(expected)
      expect(getTranslation(input)).toBe(i18n[expected])
    }
  })

  test.each(['en', 'ru'] as const)('profile text fits Telegram limits in %s', language => {
    expect(i18n[language].profile.shortDescription().length).toBeLessThanOrEqual(120)
    expect(i18n[language].profile.description().length).toBeLessThanOrEqual(512)
  })

  test('old reply keyboard labels still work after an interface language change', async () => {
    const handler = jest.fn()
    const state: TState & { menu: NonNullable<TState['menu']> } = {
      stateName: EState.MAIN,
      menu: async ctx => ({
        text: '',
        buttons: [[[getTranslation(ctx.from.language_code).button.back(), handler]]],
      }),
    }
    const ctx = ctxFor('en')
    expect(await getMenuTextHandler(ctx, state, i18n.en.button.back())).toBe(handler)
    expect(await getMenuTextHandler(ctx, state, i18n.ru.button.back())).toBe(handler)
    expect(await getMenuTextHandler(ctx, state, 'ordinary search text')).toBeUndefined()
    expect(ctx.from.language_code).toBe('en')
  })

  test('language is restored if an old keyboard lookup fails', async () => {
    const ctx = ctxFor('en')
    const state: TState & { menu: NonNullable<TState['menu']> } = {
      stateName: EState.MAIN,
      menu: async ctx => {
        if (ctx.from.language_code === 'ru') throw new Error('lookup failed')
        return { text: '', buttons: [] }
      },
    }
    await expect(getMenuTextHandler(ctx, state, 'old label')).rejects.toThrow('lookup failed')
    expect(ctx.from.language_code).toBe('en')
  })
})
