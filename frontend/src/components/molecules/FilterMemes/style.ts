import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

export const s = stylex.create({
  filter: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: '30px',
  },
  content: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: '6px',
  },
  label: {
    color: color.white,
    fontSize: size.fontSlight,
    fontWeight: 'bold',
  },
})
