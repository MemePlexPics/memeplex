import { Link } from 'react-router-dom'
import { IMeme } from "../../types"

export const MemeSearchResults = (props: { memes: IMeme[] }) => {
    return (
        <div id="results">
            {props.memes.map((meme) => (
                <div key={meme.id} className="result-container">
                    <Link to={`/memes/${meme.id}`}>
                        <img
                            className="result-image"
                            src={meme.fileName}
                            alt={meme.text?.rus || meme.text?.eng}
                        />
                    </Link>
                </div>
            ))}
        </div>
    )
}
