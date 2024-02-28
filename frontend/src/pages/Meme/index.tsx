import { useParams } from "react-router-dom"
import { useAtomValue } from 'jotai'

import { memesAtom } from "../../store/atoms"
import { useFetch, useMeta, useTitle } from "../../hooks"
import { getUrl } from "../../utils"
import { IMeme } from "../../types"
import { ChannelBlock, Loader } from "../../components"

import './style.css'

export const MemePage = () => {
    const { id } = useParams()
    const memes = useAtomValue(memesAtom)
    const { title } = useTitle(['Meme'])
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

    useMeta([
        {
            name: 'og:description',
            content: request.data?.text.eng || '',
        },
        {
            name: "og:title",
            content: title,
        },
        {
            name: "og:url",
            content: window.location.href,
        },
        {
            name: "og:image",
            content: request.data?.fileName || '',
        },
    ])

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
                    {Object.entries(request.data?.text).map(([_lang, text]) => (
                        <p className="meme-text-lang">
                            <b>Text: </b>
                            {text.split('\n').map(line => (
                                <span>{line}</span>
                            ))}
                        </p>
                    ))}
                </div>
                <div className="meme-source">
                    <p>
                        <b>Source: </b>
                        <ChannelBlock
                            username={request.data.channel}
                            id={request.data.message}
                            className='source-block'
                        />
                    </p>
                </div>
            </div>
        </div>
    )
}
