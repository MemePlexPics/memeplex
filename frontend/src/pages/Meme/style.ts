import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

const mediaPortrait = '@media (orientation: portrait)'

export const s = stylex.create({
  meme: {
    paddingBottom: '50px',
    display: 'grid',
    width: '100%',
    gap: '20px',
    gridTemplateAreas: {
      default: '"m d"',
      [mediaPortrait]: '"d" "m"',
    },
  },
  memeImageContainer: {
    gridArea: 'm',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'start',
  },
  memeImage: {
    width: '100%',
  },
  memeActions: {
    position: 'absolute',
    padding: '20px',
    backgroundColor: color.black_1,
    borderRadius: '14px',
  },
  trashIcon: {
    height: '100px',
    cursor: 'pointer',
  },
  memeTextLang: {
    display: 'flex',
    flexDirection: 'column',
  },
  memeDescription: {
    gridArea: 'd',
    color: color.white,
    width: '100%',
    fontSize: size.fontNormal,
  },
  linkSource: {
    color: 'inherit',
  },
  messageText: {
    color: color.white,
    fontSize: size.fontBig,
  },
  sourceBlock: {
    maxWidth: '360px',
  },
})
