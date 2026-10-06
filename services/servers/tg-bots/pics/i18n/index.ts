import { ru } from './ru'
import { en } from './en'
import type { Language, Translation } from './types'

export const i18n: Record<Language, Translation> = { en, ru }
export const resolveLanguage = (languageCode?: string | null): Language =>
  languageCode?.toLowerCase().split(/[-_]/)[0] === 'ru' ? 'ru' : 'en'
export const getTranslation = (languageCode?: string | null): Translation =>
  i18n[resolveLanguage(languageCode)]

export const translateTopic = (name: string, languageCode?: string | null): string => {
  if (resolveLanguage(languageCode) === 'ru') return name
  const names: Record<string, string> = {
    Отношения: 'Relationships',
    'Айти / Программирование': 'IT / Programming',
    Общество: 'Society',
    Крипта: 'Crypto',
  }
  return names[name] ?? name
}
