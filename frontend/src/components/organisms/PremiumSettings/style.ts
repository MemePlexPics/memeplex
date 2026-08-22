import stylex from '@stylexjs/stylex'

export const s = stylex.create({
  premium: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '400px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
})
