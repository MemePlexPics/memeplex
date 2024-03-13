import stylex from '@stylexjs/stylex'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useClickOutside } from '../../hooks'

import { s } from './style'
import { IDialogProps } from './types'

import { Button } from '@/components/atoms'

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
    <dialog
      {...stylex.props(s.dialog)}
      ref={dialogRef}
    >
      <div
        {...stylex.props(s.content)}
        ref={dialogContentRef}
      >
        <p {...stylex.props(s.text)}>
          {props.text?.split('\n').map((line, i) => <span key={i}>{line}</span>)}
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
  )
}
