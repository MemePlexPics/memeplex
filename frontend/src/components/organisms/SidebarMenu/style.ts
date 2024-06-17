import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

const mobile = '@media (pointer: coarse) and (orientation:portrait)'
const portrait = '@media (orientation:portrait)'

export const s = stylex.create({
  sidebar: {
    display: 'flex',
    height: '100vh',
    left: 0,
    position: {
      default: 'relative',
      [mobile]: 'fixed',
      [portrait]: 'fixed',
    },
    top: 0,
    zIndex: 1,
  },
  isActive: {
    backgroundColor: color.black_1,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: {
      default: size.sidebarWidth,
      [mobile]: 'initial',
    },
  },
  list: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  menu: {
    alignSelf: {
      default: 'center',
      [mobile]: 'initial',
    },
    display: 'flex',
    flexDirection: 'column',
    fontSize: {
      default: size.fontNormal,
      [mobile]: size.fontBig,
    },
    width: '100%',
  },
  link: {
    alignItems: 'center',
    backgroundColor: {
      ':hover': color.darkGray,
    },
    color: color.white,
    display: 'flex',
    gap: '6px',
    padding: '4px 20px',
    paddingBottom: '6px',
    textDecoration: 'none',
    transition: `
      background-color .3s,
      color .3s
    `,
    whiteSpace: 'nowrap',
  },
  activeLink: {
    backgroundColor: color.lightGray,
    color: color.black_1,
  },
  hamburger: {
    color: color.gray,
    cursor: 'pointer',
    fontSize: size.fontHamburgerMenuIcon,
    padding: '20px',
  },
  languageSelectorContainer: {
    color: color.white,
    display: 'flex',
    flexDirection: 'column',
    fontSize: size.fontNormal,
    gap: '4px',
    padding: '20px',
  },
})
