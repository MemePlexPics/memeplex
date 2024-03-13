import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

const mobilePortrait =
  '@media (pointer: coarse)'

export const s = stylex.create({
  sidebar: {
    position: {
      default: 'relative',
      [mobilePortrait]: 'fixed',
    },
    left: 0,
    top: 0,
    padding: '20px',
    height: '100vh',
    zIndex: 1,
  },
  isActive: {
    backgroundColor: color.black_1,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: {
      default: 0,
      [mobilePortrait]: '30px 0',
    },
  },
  menu: {
    fontSize: size.fontBig,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: '290px',
  },
  link: {
    color: color.white,
    textDecoration: 'none',
  },
  activeLink: {
    color: color.darkGray,
  },
  hamburger: {
    cursor: 'pointer',
    color: color.gray,
    fontSize: '3em',
    display: {
      default: 'none',
      [mobilePortrait]: 'initial',
    },
  },
  languageSelectorContainer: {
    position: 'absolute',
    bottom: '20px',
    fontSize: size.fontNormal,
    color: color.white,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
})
