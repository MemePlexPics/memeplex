import stylex from '@stylexjs/stylex'

import { color } from '@/styles/variables.stylex'

export const s = stylex.create({
  scrollable: {
    overflow: {
      default: 'hidden',
      ':hover': 'scroll',
      ':focus': 'scroll',
      ':active': 'scroll',
    },
    scrollbarColor: `${color.darkGray} transparent`,
    scrollbarWidth: 'thin',
  },
  horizontal: {
    maskImage: '-webkit-linear-gradient(right, rgba(0,0,0,0), rgba(0,0,0,1) 20%)',
  },
  vertical: {},
})
