import stylex from '@stylexjs/stylex'
import { size } from '../../styles/variables.stylex'

const MOBILE_PORTRAIT =
  '@media only screen and (hover: none) and (pointer: coarse) and (orientation:portrait)'

export const s = stylex.create({
  results: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: {
      default: '14px',
      [MOBILE_PORTRAIT]: '3vw',
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
      [MOBILE_PORTRAIT]: 'initial',
    },
    width: {
      default: size.memeEntity,
      [MOBILE_PORTRAIT]: '100%',
    },
  },
})
