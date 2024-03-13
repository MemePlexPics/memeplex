import { useEffect, useRef, useState } from 'react'

import { IDialogProps } from './types'
import { Button } from '..'
import { useClickOutside } from '../../hooks'
import stylex from '@stylexjs/stylex'
import { s } from './style'
import { useTranslation } from 'react-i18next'

export const Dialog = (props: IDialogProps) => {
  const { t } = useTranslation()
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

  return (
    <>
      <dialog
        {...stylex.props(s.dialog)}
        ref={dialogRef}
      >
        <div
          {...stylex.props(s.content)}
          ref={dialogContentRef}
        >
          <p {...stylex.props(s.text)}>
            {props.text?.split('\n')?.map(line => <span>{line}</span>)}
          </p>
          <div>{props.children}</div>
          <div {...stylex.props(s.actionButtons)}>
            <Button onClick={onClickAccept}>{t('button.ok')}</Button>
            {props.rejectText !== false ? (
              <Button onClick={onClickReject}>{t('button.cancel')}</Button>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  )
}
