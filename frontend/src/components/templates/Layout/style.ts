import stylex from '@stylexjs/stylex'

export const s = stylex.create({
  content: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '40px 5vw 14px 5vw',
    width: '100%',
  },
  main: {
    display: 'flex',
    alignItems: 'center',
    paddingTop: '40px',
    maxWidth: '90vw',
    width: '100%',
    flexDirection: 'column',
    maxHeight: 'calc(100% - 54px)',
    height: '100%',
  },
})
