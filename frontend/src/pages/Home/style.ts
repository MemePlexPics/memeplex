import stylex from '@stylexjs/stylex'

import { size, color } from '@/styles/variables.stylex'

const mobile = '@media (pointer: coarse)'

export const s = stylex.create({
  homePage: {
    maxWidth: {
        default: `calc((100vw - ${size.sidebarWidth}) * 0.9)`,
        [mobile]: 'initial',
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
    margin: '0px',
    color: color.white,
    fontSize: size.fontSlight,
  },
  featuredChannels: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingBottom: '30px',
    height: '128px',
    maxWidth: '90vw',
    width: '100%',
  },
  featuredChannelsHead: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10px',
  },
  addYourChannelLink: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    textDecoration: 'none',
    color: color.white,
    fontSize: size.fontSlight,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: color.darkGray,
    borderRadius: '5px',
    height: '30px',
    padding: '0 8px',
  },
})
