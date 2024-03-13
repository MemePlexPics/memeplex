import stylex from '@stylexjs/stylex'

import { color } from '../../../styles/variables.stylex'

export const s = stylex.create({
  scrollable: {
    scrollbarWidth: 'thin',
    scrollbarColor: `${color.darkGray} transparent`,
    overflow: {
      default: 'hidden',
      ':hover': 'scroll',
      ':active': 'scroll',
      ':focus': 'scroll',
    },
  },
  horizontal: {
    maskImage: '-webkit-linear-gradient(right, rgba(0,0,0,0), rgba(0,0,0,1) 20%)',
  },
  vertical: {},
})
