import classnames from 'classnames'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import './style.css'

type ButtonProps = {
  className?: string
  isActive?: boolean
  children?: ReactNode
} & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({ className, isActive, children, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      className={classnames('button', className, { isActive })}
    >
      {children ?? props.value}
    </button>
  )
}
