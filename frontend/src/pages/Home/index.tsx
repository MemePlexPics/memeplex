import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import stylex from '@stylexjs/stylex'
import { useAtomValue } from 'jotai'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { FeaturedChannelList, Loader, MemeSearchForm, MemeSearchResults } from '../../components'

import { FilterMemes } from '../../components/molecules'
import { useMeta, useTitle } from '../../hooks'

import { pageOptionsAtom } from '../../store/atoms'

import { useMemes } from './hooks/useMemes'

import { s } from './style'

import { calculateHowManyObjectFit } from '@/utils'

export const HomePage = () => {
  const { t } = useTranslation()
  const [query, setQuery] = useState(useAtomValue(pageOptionsAtom).query)
  const data = useMemes(query)
  const { title } = useTitle([])
  const visualMemesContainerWidth = useRef(
    calculateHowManyObjectFit((window.innerWidth - 288) * 0.9, 300, 14).supposedWidth,
  )

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
      name: 'og:title',
      content: title,
    },
    {
      name: 'og:url',
      content: window.location.href,
    },
    {
      name: 'og:image',
      content: '/android-chrome-192x192.png',
    },
  ])

  return (
    <div {...stylex.props(s.homePage)}>
      <MemeSearchForm
        query={query}
        onUpdate={setQuery}
      />
      {!query ? (
        <div
          style={{
            width:
              window.screen.orientation.type !== 'portrait-primary'
                ? visualMemesContainerWidth.current
                : undefined,
          }}
        >
          <div {...stylex.props(s.featuredChannels)}>
            <div {...stylex.props(s.featuredChannelsHead)}>
              <h3 {...stylex.props(s.featuredChannelsHeader)}>{t('label.featuredChannels')}</h3>
              <Link
                to='https://t.me/memeplex_pics/20'
                target='_blank'
                {...stylex.props(s.addYourChannelLink)}
              >
                <FontAwesomeIcon icon={faPlus} />
                {t('button.addYourChannelToFavorite')}
              </Link>
            </div>
            <FeaturedChannelList withoutLoader />
          </div>
          <FilterMemes />
        </div>
      ) : null}
      <Loader
        state={data.isLoading}
        overPage
      />
      {data.isLoaded && !data.memes.length ? (
        <p {...stylex.props(s.nothingFound)}>{t('label.nothingFound')}</p>
      ) : data.memes.length ? (
        <MemeSearchResults memes={data.memes} />
      ) : null}
      {data.isError ? <p {...stylex.props(s.errorResponse)}>{t('label.errorOccured')}</p> : null}
    </div>
  )
}
