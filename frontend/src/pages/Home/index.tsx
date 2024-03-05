import { useRef, useState } from "react"
import { useTranslation } from 'react-i18next'
import { FeaturedChannelList, Loader, MemeSearchForm, MemeSearchResults } from "../../components"
import { useMemes } from "./hooks/useMemes"
import './style.css'
import { useAtomValue } from "jotai"
import { pageOptionsAtom } from "../../store/atoms"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons"
import { useMeta, useTitle } from "../../hooks"
import { calculateHowManyObjectFit } from "../../utils"

export const HomePage = () => {
    const { t } = useTranslation()
    const [query, setQuery] = useState(useAtomValue(pageOptionsAtom).query)
    const data = useMemes(query)
    const { title } = useTitle([])
    const visualMemesContainerWidth = useRef(calculateHowManyObjectFit(window.innerWidth * 0.9, 300, 14).supposedWidth)

    useMeta([
        {
            name: 'description',
            content: t('meta.homeDescription'),
        },
        {
            name: 'og:description',
            content: t('meta.homeDescription'),
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
                ? <div
                    className="featured-channels"
                    style={{ width: window.screen.orientation.type !== 'portrait-primary'
                        ? visualMemesContainerWidth.current
                        : undefined
                    }}
                >
                    <div className="featured-channels-head">
                        <h3 className="featured-channels-header">{t('label.featuredChannels')}</h3>
                        <Link
                            to='https://t.me/memeplex_pics/20'
                            target='_blank'
                            className="add-your-channel-link"
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            {t('button.addYourChannelToFavorite')}
                        </Link>
                    </div>
                    <FeaturedChannelList withoutLoader />
                </div>
                : null
            }
            <Loader state={data.isLoading} overPage />
            {data.isLoaded && !data.memes.length
                ? <p className='nothing-found'>{t('label.nothingFound')}</p>
                : data.memes.length
                    ? <MemeSearchResults memes={data.memes} />
                    : null
            }
            {data.isError
                ? <p className='error-response'>{t('label.errorOccured')}</p>
                : null
            }
        </>
    )
}
