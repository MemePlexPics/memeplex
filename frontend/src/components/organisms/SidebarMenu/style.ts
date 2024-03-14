import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

const mobile = '@media (pointer: coarse)'

export const s = stylex.create({
  sidebar: {
    display: 'flex',
    position: {
      default: 'relative',
      [mobile]: 'fixed',
    },
    left: 0,
    top: 0,
    height: '100vh',
    zIndex: 1,
  },
  isActive: {
    backgroundColor: color.black_1,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    width: size.sidebarWidth,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  menu: {
    alignSelf: {
      default: 'center',
      [mobile]: 'initial',
    },
    fontSize: {
      default: size.fontNormal,
      [mobile]: size.fontBig,
    },
    display: 'flex',
    flexDirection: 'column',
    // gap: '8px',
    width: '100%',
  },
  link: {
    display: 'flex',
    color: color.white,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    padding: '4px 20px',
    paddingBottom: '6px',
    gap: '6px',
    alignItems: 'center',
    transition: `
      background-color .3s,
      color .3s
    `,
    backgroundColor: {
      ':hover': color.darkGray,
    },
  },
  activeLink: {
    color: color.black_1,
    backgroundColor: color.lightGray,
  },
  hamburger: {
    padding: '20px',
    cursor: 'pointer',
    color: color.gray,
    fontSize: size.fontHamburgerMenuIcon,
    display: {
      default: 'none',
      [mobile]: 'initial',
    },
  },
  languageSelectorContainer: {
    fontSize: size.fontNormal,
    color: color.white,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '20px',
  },
})
