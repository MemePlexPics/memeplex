import { atom } from 'jotai'
import { IPageOptions } from '../../pages/Home/types'
import { pageOptionsDefault } from '../../pages/Home/hooks/constants'

export const pageOptionsAtom = atom<IPageOptions>({ ...pageOptionsDefault })
