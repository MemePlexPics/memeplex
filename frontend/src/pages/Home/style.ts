import stylex from '@stylexjs/stylex'

import { size, color } from '@/styles/variables.stylex'

const mobile = '@media (pointer: coarse)'
const portrait = '@media (orientation:portrait)'

export const s = stylex.create({
  homePage: {
    maxWidth: {
      default: `calc((100vw - ${size.sidebarWidth}) * 0.9)`,
      [mobile]: 'initial',
      [portrait]: 'initial',
    },
  },
  nothingFound: {
    color: color.white,
    fontSize: size.fontBig,
  },
  errorResponse: {
    color: color.white,
    fontSize: size.fontBig,
  },
  featuredChannelsHeader: {
    color: color.white,
    fontSize: size.fontSlight,
    margin: '0px',
  },
  featuredChannels: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    height: '128px',
    maxWidth: '90vw',
    paddingBottom: '30px',
    width: '100%',
  },
  featuredChannelsHead: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
  },
  addYourChannelLink: {
    alignItems: 'center',
    borderColor: color.darkGray,
    borderRadius: '5px',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: color.white,
    display: 'flex',
    fontSize: size.fontSlight,
    gap: '4px',
    height: '30px',
    padding: '0 8px',
    textDecoration: 'none',
  },
})
