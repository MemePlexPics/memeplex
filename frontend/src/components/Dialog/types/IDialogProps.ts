export interface IDialogProps {
    isOpen: boolean
    text?: string
    rejectText?: string | false
    onClickAccept?: () => unknown
    onClickReject?: () => unknown
}
