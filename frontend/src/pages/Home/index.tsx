
import { useState } from "react"
import { FeaturedChannelList, Loader, MemeSearchForm, MemeSearchResults } from "../../components"
import { useMemes } from "./hooks/useMemes"
import './style.css'
import { useAtomValue } from "jotai"
import { pageOptionsAtom } from "../../store/atoms"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useMeta, useTitle } from "../../hooks"

export const HomePage = () => {
    const [query, setQuery] = useState(useAtomValue(pageOptionsAtom).query)
    const data = useMemes(query)
    const { title } = useTitle([])

    useMeta([
        {
            name: 'og:description',
            content: 'Search engine for memes with a focus on Russian underground Telegram',
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
            content: "/android-chrome-192x192.png",
        },
    ])

    return (
        <>
            <MemeSearchForm query={query} onUpdate={(query) => setQuery(query)} />
            {!query
                ? <div className="featured-channels">
                    <div className="featured-channels-head">
                        <h3 className="featured-channels-header">Featured channels</h3>
                        <Link
                            to='https://t.me/memeplex_pics/20'
                            target='_blank'
                            className="add-your-channel-link"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            your channel
                        </Link>
                    </div>
                    <FeaturedChannelList withoutLoader />
                </div>
                : null
            }
            <Loader state={data.isLoading} overPage />
            {data.isLoaded && !data.memes.length
                ? <p className='nothing-found'>Nothing found</p>
                : data.memes.length
                    ? <MemeSearchResults memes={data.memes} />
                    : null
            }
            {data.isError
                ? <p className='error-response'>An error occurred, please try again later</p>
                : null
            }
        </>
    )
}
