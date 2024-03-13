export interface IDialogProps {
  isOpen: boolean
  text?: string
  rejectText?: string | false
  children?: React.ReactNode
  onClickAccept?: () => unknown
  onClickReject?: () => unknown
}
