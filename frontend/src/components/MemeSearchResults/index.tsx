import { IMeme } from "../../types"

import './style.css'
import { MemeContainer } from '..'

export const MemeSearchResults = (props: { memes: IMeme[] }) => {
    return (
        <div id="results">
            {props.memes.map((meme) => (
                <div key={meme.id} className="result-container">
                    <MemeContainer meme={meme} />
                </div>
            ))}
        </div>
    )
}
