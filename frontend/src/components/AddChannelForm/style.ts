import stylex from '@stylexjs/stylex'

export const s = stylex.create({
  addChannelForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxWidth: '800px',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '4px',
  },
})
