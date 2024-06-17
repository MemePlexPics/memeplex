import stylex from '@stylexjs/stylex'

import { size } from '@/styles/variables.stylex'

const mobilePortrait =
  '@media only screen and (hover: none) and (pointer: coarse) and (orientation:portrait)'

export const s = stylex.create({
  results: {
    display: 'grid',
    flexWrap: 'wrap',
    gap: {
      default: '14px',
      [mobilePortrait]: '3vw',
    },
    gridTemplateColumns: {
      default: 'repeat(auto-fill, minmax(300px, 1fr))',
      [mobilePortrait]: 'initial',
    },
    justifyContent: 'center',
    paddingBottom: '80px',
  },
  result: {
    alignItems: 'center',
    display: 'flex',
    height: {
      default: size.memeEntity,
      [mobilePortrait]: 'initial',
    },
    justifyContent: 'center',
    width: {
      default: size.memeEntity,
      [mobilePortrait]: '100%',
    },
  },
})
