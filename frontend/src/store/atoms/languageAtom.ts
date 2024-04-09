import { atomWithStorage } from 'jotai/utils'

const navigatorLanguage = navigator.language ? navigator.language.split('-')[0] : undefined
const defaultValue = navigatorLanguage === 'ru' ? 'ru' : 'en'

export const languageAtom = atomWithStorage<'ru' | 'en'>(
  'language',
  defaultValue,
  {
    getItem: (key, initialValue) =>
      (localStorage.getItem(key) as null | 'ru' | 'en') || initialValue,
    setItem: (key, newValue) => localStorage.setItem(key, newValue),
    removeItem: key => localStorage.removeItem(key),
  },
  { getOnInit: true },
)
