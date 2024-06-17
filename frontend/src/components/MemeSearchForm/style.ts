import stylex from '@stylexjs/stylex'

const mobile = '@media (pointer: coarse)'

export const s = stylex.create({
  container: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'center',
    paddingBottom: '40px',
    width: {
      default: '70vw',
      [mobile]: '100%',
    },
  },
})
