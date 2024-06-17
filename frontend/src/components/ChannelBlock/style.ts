// style.ts
import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

const hoverNone = '@media (hover: none) and (pointer: coarse)'

export const s = stylex.create({
  channelBlock: {
    backgroundColor: {
      [hoverNone]: color.black_1,
      ':hover': color.black_2,
    },
    borderColor: {
      default: color.darkGray,
      ':hover': color.black_1,
    },
    borderRadius: '8px',
    borderStyle: 'solid',
    borderWidth: {
      default: '1px',
      [hoverNone]: 0,
    },
    color: color.white,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
    padding: {
      [hoverNone]: '5px',
    },
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  isUnavailable: {
    backgroundColor: {
      default: color.orange,
      ':hover': color.orangeRed,
    },
    color: color.black_1,
  },
  isDisabled: {
    backgroundColor: {
      default: color.gray,
      [hoverNone]: color.darkGray,
      ':hover': color.darkGray,
    },
    color: color.black_1,
  },
  channelInfo: {
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'row',
    textDecoration: 'none',
  },
  smallAvatar: {
    height: '40px',
    padding: '5px',
  },
  smallChannelName: {
    fontSize: size.fontSlight,
  },
  smallChannelBlock: {
    paddingRight: '4px',
  },
  avatar: {
    borderRadius: '50%',
    height: '64px',
    padding: '8px',
  },
  channelName: {
    alignItems: 'center',
    display: 'flex',
  },
  channelActions: {
    display: 'none',
  },
  channelActionsVisible: {
    alignItems: 'center',
    backgroundColor: color.black_1,
    display: 'flex',
    gap: '14px',
    height: '100%',
    padding: '0 14px',
    position: 'absolute',
    right: 0,
  },
  actionIcon: {
    cursor: 'pointer',
  },
})
