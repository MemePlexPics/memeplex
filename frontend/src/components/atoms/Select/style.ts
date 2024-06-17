import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  select: {
    backgroundColor: color.black_1,
    borderColor: color.lightGray,
    borderRadius: '4px',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: color.white,
    fontSize: size.fontNormal,
    padding: '4px',
    width: '100%',
  },
})
