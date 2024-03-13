import stylex from '@stylexjs/stylex'

import { MemeContainer } from '..'
import { IMeme } from '../../types'

import { s } from './style'

export const MemeSearchResults = (props: { memes: IMeme[] }) => {
  return (
    <div {...stylex.props(s.results)}>
      {props.memes.map(meme => (
        <div
          key={meme.id}
          {...stylex.props(s.result)}
        >
          <MemeContainer meme={meme} />
        </div>
      ))}
    </div>
  )
}
