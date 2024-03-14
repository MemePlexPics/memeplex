import stylex from '@stylexjs/stylex'

const mobile = '@media (pointer: coarse)'

export const s = stylex.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: '40px',
    gap: '4px',
    width: {
      default: '70vw',
      [mobile]: '100%',
    },
  },
})
