import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  dialog: {
    backgroundColor: color.lightGray,
    '::backdrop': {
      background: '#0000007d',
    },
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  actionButtons: {
    display: 'flex',
    gap: '4px',
    justifyContent: 'flex-end',
  },
  text: {
    color: color.black_2,
    display: 'flex',
    flexDirection: 'column',
    fontSize: size.fontNormal,
    margin: 0,
  },
})
