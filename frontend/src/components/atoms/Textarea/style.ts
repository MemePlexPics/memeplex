import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  textarea: {
    color: color.white,
    fontSize: size.fontBig,
    backgroundColor: color.black_1,
    borderRadius: '8px',
    borderColor: color.darkGray,
  },
})
