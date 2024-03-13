import { atom } from 'jotai'

import { pageOptionsDefault } from '../../pages/Home/hooks/constants'
import { IPageOptions } from '../../pages/Home/types'

export const pageOptionsAtom = atom<IPageOptions>({ ...pageOptionsDefault })
