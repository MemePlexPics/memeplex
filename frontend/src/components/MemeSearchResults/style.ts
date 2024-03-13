import stylex from '@stylexjs/stylex'

import { size } from '../../styles/variables.stylex'

const mobilePortrait =
  '@media only screen and (hover: none) and (pointer: coarse) and (orientation:portrait)'

export const s = stylex.create({
  results: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: {
      default: '14px',
      [mobilePortrait]: '3vw',
    },
    justifyContent: 'center',
    paddingBottom: '80px',
  },
  result: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: {
      default: size.memeEntity,
      [mobilePortrait]: 'initial',
    },
    width: {
      default: size.memeEntity,
      [mobilePortrait]: '100%',
    },
  },
})
