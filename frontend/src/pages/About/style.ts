import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  about: {
    color: color.white,
    display: 'flex',
    fontSize: size.fontBig,
    gap: '2vw',
  },
  link: {
    color: color.white,
  },
  p: {
    margin: '10px 0',
  },
})
