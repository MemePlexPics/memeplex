import stylex from '@stylexjs/stylex'

const MOBILE_PORTRAIT =
  '@media only screen and (hover: none) and (pointer: coarse) and (orientation:portrait)'

export const color = stylex.defineVars({
  white: '#EEE',
  gray: '#b5b5b5',
  darkGray: '#746c5f',
  lightGray: '#d3d3d3',
  black_1: '#151617',
  black_2: '#222',
})

export const size = stylex.defineVars({
  loader: '100px',
  scrollToTop: {
    default: '60px',
    [MOBILE_PORTRAIT]: '10vw',
  },
  hamburgerIconWidth: {
    default: '45px',
    [MOBILE_PORTRAIT]: '6vw',
  },
  hamburgerIconHeight: {
    default: '30px',
    [MOBILE_PORTRAIT]: '4vw',
  },
  fontSlight: {
    default: '18px',
    [MOBILE_PORTRAIT]: '26px',
  },
  fontNormal: {
    default: '26px',
    [MOBILE_PORTRAIT]: '30px',
  },
  fontBig: {
    default: '30px',
    [MOBILE_PORTRAIT]: '36px',
  },
  memeEntity: '300px',
})
