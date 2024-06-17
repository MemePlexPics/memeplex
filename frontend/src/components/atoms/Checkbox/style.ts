import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  container: {
    alignContent: 'center',
    display: 'flex',
    flexDirection: 'row-reverse',
    gap: '6px',
    justifyContent: 'flex-end',
  },
  label: {
    color: color.white,
    fontSize: size.fontBig,
  },
  checkbox: {
    height: '20px',
    width: '20px',
  },
})
