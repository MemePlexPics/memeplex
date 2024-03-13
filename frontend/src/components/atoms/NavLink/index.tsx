import stylex, { StyleXStyles } from '@stylexjs/stylex'
import { Link, LinkProps, useLocation } from 'react-router-dom'

export const NavLink = ({
  activeStyle,
  stylexStyles,
  ...props
}: {
  activeStyle?: StyleXStyles
  stylexStyles?: StyleXStyles
} & LinkProps) => {
  const { pathname } = useLocation()

  const isActive = pathname === props.to

  return (
    <Link
      to={props.to}
      {...stylex.props(stylexStyles, isActive ? activeStyle : null)}
    >
      {props.children}
    </Link>
  )
}
