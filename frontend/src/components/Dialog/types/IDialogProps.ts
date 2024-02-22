export interface IDialogProps {
    isOpen: boolean
    text?: string
    onClickAccept?: () => unknown
    onClickReject?: () => unknown
}
