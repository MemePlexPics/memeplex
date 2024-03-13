import { atom } from 'jotai'

import { IDialogProps } from '../../components/Dialog/types'

export const dialogConfirmationAtom = atom<IDialogProps>({
  isOpen: false,
})
