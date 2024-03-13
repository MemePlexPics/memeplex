import stylex from '@stylexjs/stylex'

const mobilePortrait =
  '@media only screen and (hover: none) and (pointer: coarse) and (orientation:portrait)'

export const s = stylex.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: '40px',
    gap: '4px',
    width: {
      default: '70vw',
      [mobilePortrait]: '100%',
    },
  },
})
