import classNames from 'classnames'
import { InputHTMLAttributes } from 'react'

import './style.css'

type TDefaultInput = InputHTMLAttributes<HTMLInputElement>

export const Input = (
  props: Omit<TDefaultInput, 'onInput'> & {
    onInput?: (value: string) => unknown
    onPressEnter?: (value: string) => unknown
  },
) => {
  const onInput = (e: React.FormEvent<HTMLInputElement>) => {
    const value = (e.target as HTMLInputElement).value
    props.onInput?.(value)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return
    props.onPressEnter?.((event.target as HTMLInputElement).value)
  }

  return (
    <input
      {...props}
      className={classNames(props.className, 'input')}
      onInput={onInput}
      onKeyDown={onKeyDown}
    />
  )
}
