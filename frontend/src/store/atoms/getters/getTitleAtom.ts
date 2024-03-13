import { atom } from 'jotai'

import { titleAtom } from '..'

export const getTitleAtom = atom(get => {
  const sections = [...get(titleAtom), 'MemePlex']
  return sections.join(' | ')
})
