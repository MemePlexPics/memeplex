import { useEffect, useRef, useState } from "react"
import { IDialogProps } from "./types"
import { Button } from ".."
import { useClickOutside } from "../../hooks"

import './style.css'

export const Dialog = (props: IDialogProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false)
    const dialogRef = useRef<HTMLDialogElement>(null)
    const dialogContentRef = useRef<HTMLDivElement>(null)

    const onClickAccept = () => {
        props.onClickAccept?.()
        setIsOpen(false)
        dialogRef.current?.close()
    }

    const onClickReject = () => {
        props.onClickReject?.()
        setIsOpen(false)
        dialogRef.current?.close()
    }

    useEffect(() => {
        setIsOpen(props.isOpen)
        if (props.isOpen) dialogRef.current?.showModal()
        else dialogRef.current?.close()
    }, [props.isOpen])

    useClickOutside(dialogContentRef, () => {
      if (isOpen) onClickReject()
    })

    return <>
      <dialog className="dialog" ref={dialogRef}>
        <div className="dialog-container" ref={dialogContentRef}>
          <p className="dialog-text">{props.text}</p>
          <div className="action-buttons">
            <Button onClick={onClickAccept}>OK</Button>
            <Button onClick={onClickReject}>Cancel</Button>
          </div>
        </div>
      </dialog>
    </>
}
