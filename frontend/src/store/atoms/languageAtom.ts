import { atomWithStorage } from 'jotai/utils'

export const languageAtom = atomWithStorage<'ru' | 'en'>('language', 'ru', {
    getItem: (key, initialValue) => localStorage.getItem(key) as 'ru' | 'en' || initialValue,
    setItem: (key, newValue) => localStorage.setItem(key, newValue),
    removeItem: (key) => localStorage.removeItem(key),
}, { getOnInit: true })
