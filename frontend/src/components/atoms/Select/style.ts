import stylex from '@stylexjs/stylex'

import { color, size } from '../../../styles/variables.stylex'

export const s = stylex.create({
  select: {
    backgroundColor: color.black_1,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.lightGray,
    borderRadius: '4px',
    color: color.white,
    fontSize: size.fontNormal,
    width: '100%',
    padding: '4px',
  },
})
