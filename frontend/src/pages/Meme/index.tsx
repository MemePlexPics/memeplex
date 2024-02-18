import { Link, useParams } from "react-router-dom"
import { useAtomValue } from 'jotai'
import { memesAtom } from "../../store/atoms"

import './style.css'
import { useFetch } from "../../hooks"
import { getUrl } from "../../utils"
import { IMeme } from "../../types"
import { Loader } from "../../components"

export const MemePage = () => {
    const { id } = useParams()
    const memes = useAtomValue(memesAtom)
    const request = useFetch<IMeme>(
        () => getUrl('/getMeme', { id }),
        {
            deps: [id],
            getCached: () => {
                return memes.length
                    ? memes.find(meme => meme?.id === id) || null
                    : null
            }
        }
    )

    if (request.isLoading) return <Loader />

    if (request.isError) {
        if (request.status === 204) return <p className="unexisted-meme">This meme is not in the database</p>
        return <p className="error-response">An error occurred, please try later</p>
    }

    if (!request.data) return <p className='nothing-found'>Meme not found</p>

    return (
        <div id="meme">
            <img className="meme-image" src={'/' + request.data.fileName} />
            <div className="meme-description">
                <div className="meme-text">
                    {Object.entries(request.data?.text).map(([lang, text]) => (
                        <p className="meme-text-lang">
                            <b>{lang}: </b>
                            {text}
                        </p>
                    ))}
                </div>
                <div className="meme-source">
                    <p>
                        <b>Source: </b>
                        <Link
                            to={`https://t.me/${request.data.channel}/${request.data.message}`}
                            target="_blank"
                            className="link-source"
                        >
                            {`https://t.me/${request.data.channel}/${request.data.message}`}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
