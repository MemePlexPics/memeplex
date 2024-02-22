import { useAtom } from "jotai"
import { Dialog } from ".."
import { dialogConfirmationAtom } from "../../store/atoms/dialogConfirmationAtom"

export const DialogConfirmation = () => {
    const [dialogProps, setDialogProps] = useAtom(dialogConfirmationAtom)

    const onClickConfirm = () => {
        dialogProps.onClickAccept?.()
        setDialogProps((prev) => ({ ...prev, isOpen: false }))
    }

    const onClickReject = () => {
        dialogProps.onClickReject?.()
        setDialogProps((prev) => ({ ...prev, isOpen: false }))
    }

    return <>
        <Dialog
            {...dialogProps}
            onClickAccept={onClickConfirm}
            onClickReject={onClickReject}
        />
    </>
}
