import { IMeme } from "../../types"

import { MemeContainer } from '..'
import * as stylex from '@stylexjs/stylex'
import { s } from "./style"

export const MemeSearchResults = (props: {
    memes: IMeme[]
}) => {
    return (
        <div {...stylex.props(s.results)}>
            {props.memes.map((meme) => (
                <div key={meme.id} {...stylex.props(s.result)}>
                    <MemeContainer meme={meme} />
                </div>
            ))}
        </div>
    )
}
