import { Link, useParams } from "react-router-dom"
import { useAtomValue } from 'jotai'
import { memesAtom } from "../../store/atoms"

import './style.css'
import { useFetch } from "../../hooks/useFetch"
import { getUrl } from "../../utils"
import { IMeme } from "../../types"
import { useRef } from "react"
import { Loader } from "../../components"

export const Meme = () => {
    const { id } = useParams()
    const memes = useAtomValue(memesAtom)
    const url = useRef(getUrl('/getMeme', { id }))
    const request = useFetch<IMeme>(
        url.current,
        { 
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
                    <h3>Text</h3>
                    {Object.entries(request.data?.text).map(([lang, text]) => (
                        <div className="meme-text-lang">
                            <h4>{lang}</h4>
                            <p>{text}</p>
                        </div>
                    ))}
                </div>
                <div className="meme-source">
                    <h3>Source</h3>
                    <Link
                        to={`https://t.me/${request.data.channel}/${request.data.message}`}
                        target="_blank"
                        className="link-source"
                    >
                        {`https://t.me/${request.data.channel}/${request.data.message}`}
                    </Link>
                </div>
            </div>
        </div>
    )
}
