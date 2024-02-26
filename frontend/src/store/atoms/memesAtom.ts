import { atom } from 'jotai'
import { IMeme } from '../../types'

export const memesAtom = atom<IMeme[]>([])
