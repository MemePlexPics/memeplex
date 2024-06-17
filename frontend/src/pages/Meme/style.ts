import stylex from '@stylexjs/stylex'

import { color, size } from '@/styles/variables.stylex'

const mediaPortrait = '@media (orientation: portrait)'

export const s = stylex.create({
  meme: {
    display: 'grid',
    gap: '20px',
    gridTemplateAreas: {
      default: '"m d"',
      [mediaPortrait]: '"m" "d"',
    },
    paddingBottom: '50px',
    width: '100%',
  },
  memeImageContainer: {
    alignItems: 'start',
    display: 'flex',
    gridArea: 'm',
    justifyContent: 'center',
    position: 'relative',
  },
  memeImage: {
    width: '100%',
  },
  memeActions: {
    alignSelf: 'center',
    backgroundColor: color.black_1,
    borderRadius: '14px',
    padding: '20px',
    position: 'absolute',
  },
  trashIcon: {
    cursor: 'pointer',
    height: '100px',
  },
  memeTextLang: {
    display: 'flex',
    flexDirection: 'column',
  },
  memeDescription: {
    color: color.white,
    fontSize: size.fontNormal,
    gridArea: 'd',
    width: '100%',
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
