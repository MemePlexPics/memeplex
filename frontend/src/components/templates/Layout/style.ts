import stylex from '@stylexjs/stylex'

export const s = stylex.create({
  content: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflowY: 'scroll',
    padding: '40px 5vw 14px 5vw',
    width: '100%',
  },
  main: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    maxHeight: 'calc(100% - 54px)',
    maxWidth: '90vw',
    paddingTop: '40px',
    width: '100%',
  },
})
