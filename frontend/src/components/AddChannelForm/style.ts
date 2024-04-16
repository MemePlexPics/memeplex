import stylex from '@stylexjs/stylex'

export const s = stylex.create({
  addChannelForm: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '800px',
    gap: '6px',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '4px',
  },
})
