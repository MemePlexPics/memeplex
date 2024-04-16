import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  container: {
    display: 'flex',
    alignContent: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    flexDirection: 'row-reverse',
  },
  label: {
    color: color.white,
    fontSize: size.fontBig,
  },
  checkbox: {
    width: '20px',
    height: '20px',
  },
})
