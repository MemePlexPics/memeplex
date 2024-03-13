import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import stylex from '@stylexjs/stylex'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { s } from './style'

import { LanguageSelector } from '@/components/molecules'
import { isMobile } from '@/constants'
import { useClickOutside } from '@/hooks'

export const SidebarMenu = () => {
  const { t } = useTranslation()
  const [isFolded, setIsFolded] = useState(isMobile)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useClickOutside(sidebarRef, () => {
    if (isMobile) setIsFolded(true)
  })

  useEffect(() => {
    if (isMobile) setIsFolded(true)
  }, [location])

  return (
    <div
      {...stylex.props(s.sidebar, isFolded ? null : s.isActive)}
      ref={sidebarRef}
    >
      <FontAwesomeIcon
        {...stylex.props(s.hamburger)}
        icon={faBars}
        onClick={() => { setIsFolded(!isFolded); }}
      />
      {!isFolded ? (
        <>
          <ul {...stylex.props(s.list, s.menu)}>
            {localStorage.getItem('isAdmin') === '1' ? (
              <li>
                <NavLink
                  to='/admin'
                  {...stylex.props(s.link)}
                >
                  {t('page.admin')}
                </NavLink>
              </li>
            ) : null}
            <li>
              <NavLink
                to='/channelList'
                {...stylex.props(s.link)}
              >
                {t('page.channelList')}
              </NavLink>
            </li>
            <li>
              <Link
                to='https://t.me/MemePlex_Pics'
                target='_blank'
                {...stylex.props(s.link)}
              >
                {t('page.telegramChannel')}
              </Link>
            </li>
            <li>
              <Link
                to='https://t.me/MemePlexBot'
                target='_blank'
                {...stylex.props(s.link)}
              >
                {t('page.telegramBot')}
              </Link>
            </li>
            <li>
              <NavLink
                to='/about'
                {...stylex.props(s.link)}
              >
                {t('page.about')}
              </NavLink>
            </li>
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
        </>
      ) : null}
    </div>
  )
}
