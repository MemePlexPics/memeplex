import type { ru } from './ru'

type Dictionary<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => unknown
    ? (...args: A) => string
    : Dictionary<T[K]>
}

export type Translation = Dictionary<typeof ru>
export type Language = 'en' | 'ru'
