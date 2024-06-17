import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  textarea: {
    backgroundColor: color.black_1,
    borderColor: color.darkGray,
    borderRadius: '8px',
    color: color.white,
    fontSize: size.fontBig,
  },
})
