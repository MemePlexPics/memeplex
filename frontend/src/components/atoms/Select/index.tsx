import stylex from '@stylexjs/stylex'
import React from 'react'

import { applyClassNameToStyleX } from '../../../utils'

import { s } from './style'

export const Select = (props: {
  options: Record<string, string>
  defaultValue?: string
  placeholder?: string
  className?: string
  onSelect: (value: string) => unknown
}) => {
  const onSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value
    props.onSelect(selectedOption)
  }

  return (
    <select
      {...applyClassNameToStyleX(stylex.props(s.select), props.className)}
      value={props.defaultValue}
      onChange={onSelect}
    >
      {props.placeholder ? (
        <option
          value=''
          disabled
        >
          {props.placeholder}
        </option>
      ) : null}
      {Object.entries(props.options).map(([value, title]) => (
        <option
          key={value}
          value={value}
        >
          {title}
        </option>
      ))}
    </select>
  )
}
