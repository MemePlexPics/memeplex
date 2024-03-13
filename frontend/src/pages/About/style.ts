import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  about: {
    display: 'flex',
    gap: '2vw',
    color: color.white,
    fontSize: size.fontBig,
  },
  link: {
    color: color.white,
  },
  p: {
    margin: '10px 0',
  },
})
