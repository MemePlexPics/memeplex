import stylex from '@stylexjs/stylex'
import { InputHTMLAttributes, useId } from 'react'

import { s } from './style'

type TDefaultInput = InputHTMLAttributes<HTMLInputElement>

export const Checkbox = (
  props: Omit<TDefaultInput, 'onChange' | 'id'> & {
    label?: string
    onChange?: (state: boolean) => void
  },
) => {
  const id = useId()

  const onChange = (e: React.FormEvent<HTMLInputElement>) =>
    props.onChange?.((e.target as HTMLInputElement).checked)

  return (
    <div {...stylex.props(s.container)}>
      {props.label ? (
        <label
          htmlFor={id}
          {...stylex.props(s.label)}
        >
          {props.label}
        </label>
      ) : null}
      <input
        id={id}
        {...props}
        {...stylex.props(s.checkbox)}
        type='checkbox'
        onChange={onChange}
      />
    </div>
  )
}
