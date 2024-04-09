import { faArrowUpRightFromSquare, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import stylex from '@stylexjs/stylex'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { s } from './style'

import { NavLink } from '@/components/atoms'
import { LanguageSelector } from '@/components/molecules'
import { isMobile, isOrientationPortrait } from '@/constants'
import { useClickOutside } from '@/hooks'

export const SidebarMenu = () => {
  const { t } = useTranslation()
  const [isFolded, setIsFolded] = useState(isMobile)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const isFoldable = isMobile || isOrientationPortrait

  useClickOutside(sidebarRef, () => {
    if (isFoldable) setIsFolded(true)
  })

  useEffect(() => {
    if (isFoldable) setIsFolded(true)
  }, [location])

  const menuEntitites: {
    to: string
    text: string
    external?: boolean
    isHidden?: boolean
  }[] = [
    {
      to: '/',
      text: t('page.home'),
    },
    {
      to: '/admin',
      text: t('page.admin'),
    },
    {
      to: '/channelList',
      text: t('page.channelList'),
    },
    {
      to: '/about',
      text: t('page.about'),
    },
    {
      to: 'https://t.me/MemePlex_Pics',
      text: t('page.telegramChannel'),
      external: true,
    },
    {
      to: 'https://t.me/MemePlexBot?start=website',
      text: t('page.telegramBot'),
      external: true,
    },
    {
      to: 'https://t.me/MemePlexAddBot',
      text: t('page.addMemes'),
      external: true,
    },
    {
      to: 'https://t.me/MemePlexAddBot',
      text: t('page.leaveFeedback'),
      external: true,
    },
    {
      to: 'https://github.com/MemePlexPics/memeplex',
      text: 'Github',
      external: true,
      isHidden: !isMobile
    },
  ]

  return (
    <div
      {...stylex.props(s.sidebar, isFolded ? null : s.isActive)}
      ref={sidebarRef}
    >
      {isFoldable ? (
        <FontAwesomeIcon
          {...stylex.props(s.hamburger)}
          icon={faBars}
          onClick={() => {
            setIsFolded(!isFolded)
          }}
        />
      ) : null}
      {!isFolded ? (
        <div {...stylex.props(s.content)}>
          <ul {...stylex.props(s.list, s.menu)}>
            {menuEntitites.map((entity) => {
              if (entity.isHidden) return null
              return (
                <li key={entity.text}>
                  {entity.external
                    ? (
                      <Link
                        to={entity.to}
                        target='_blank'
                        {...stylex.props(s.link)}
                      >
                        <span>{entity.text}</span>
                        <FontAwesomeIcon
                          icon={faArrowUpRightFromSquare}
                          color='gray'
                          size='xs'
                        />
                      </Link>
                    )
                    : (
                      <NavLink
                        to={entity.to}
                        activeStyle={s.activeLink}
                        stylexStyles={[s.link]}
                      >
                        <span>{entity.text}</span>
                      </NavLink>
                    )}
                </li>
              )
            })}
          </ul>
          <div {...stylex.props(s.languageSelectorContainer)}>
            <label>Language:</label>
            <LanguageSelector
              languageOpetions={{
                ru: 'Русский',
                en: 'English',
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
