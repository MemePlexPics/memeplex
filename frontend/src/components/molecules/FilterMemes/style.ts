import stylex from '@stylexjs/stylex'
import { color, size } from '../../../styles/variables.stylex'

export const s = stylex.create({
  filter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '30px',
  },
  content: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6px',
  },
  label: {
    color: color.white,
    fontSize: size.fontSlight,
    fontWeight: 'bold',
  },
})
