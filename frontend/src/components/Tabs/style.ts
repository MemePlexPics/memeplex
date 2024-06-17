import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

const topBorderRadius = '6px'

export const s = stylex.create({
  tabs: {
    display: 'flex',
    gap: '10px',
    paddingBottom: '14px',
  },
  tab: {
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderWidth: '2px',
    color: color.white,
    cursor: 'pointer',
    fontSize: size.fontBig,
    padding: '0 10px',
  },
  isActive: {
    borderBottomColor: 'transparent',
    borderColor: color.lightGray,
    borderTopLeftRadius: topBorderRadius,
    borderTopRightRadius: topBorderRadius,
  },
  tabContent: {
    display: 'none',
  },
  isActiveContent: {
    display: 'initial',
  },
})
