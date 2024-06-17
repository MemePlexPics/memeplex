import { atom } from 'jotai'

import { IGetLatest } from '../../services/types'

export const getMemesResponseAtom = atom<IGetLatest>({
  result: [],
  total: 0,
  totalPages: 0,
  from: undefined,
  to: undefined,
})
