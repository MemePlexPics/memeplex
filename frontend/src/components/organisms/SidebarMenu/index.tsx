import { faArrowUpRightFromSquare, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import stylex from '@stylexjs/stylex'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'

import { s } from './style'

import { NavLink } from '@/components/atoms'
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
        onClick={() => {
          setIsFolded(!isFolded)
        }}
      />
      {!isFolded ? (
        <div {...stylex.props(s.content)}>
          <ul {...stylex.props(s.list, s.menu)}>
            {localStorage.getItem('isAdmin') === '1' ? (
              <li>
                <NavLink
                  to='/admin'
                  activeStyle={s.activeLink}
                  stylexStyles={s.link}
                >
                  {t('page.admin')}
                </NavLink>
              </li>
            ) : null}
            <li>
              <NavLink
                to='/channelList'
                activeStyle={s.activeLink}
                stylexStyles={s.link}
              >
                {t('page.channelList')}
              </NavLink>
            </li>
            <li>
              <NavLink
                to='/about'
                activeStyle={s.activeLink}
                stylexStyles={s.link}
              >
                {t('page.about')}
              </NavLink>
            </li>
            <li>
              <Link
                to='https://t.me/MemePlex_Pics'
                target='_blank'
                {...stylex.props(s.link)}
              >
                <span>{t('page.telegramChannel')}</span>
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  color='gray'
                />
              </Link>
            </li>
            <li>
              <Link
                to='https://t.me/MemePlexBot'
                target='_blank'
                {...stylex.props(s.link)}
              >
                <span>{t('page.telegramBot')}</span>
                <FontAwesomeIcon
                  icon={faArrowUpRightFromSquare}
                  color='gray'
                />
              </Link>
            </li>
            {isMobile ? (
              <li>
                <Link
                  to='https://github.com/MemePlexPics/memeplex'
                  target='_blank'
                  {...stylex.props(s.link)}
                >
                  <span>Github</span>
                  <FontAwesomeIcon
                    icon={faArrowUpRightFromSquare}
                    color='gray'
                  />
                </Link>
              </li>
            ) : null}
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
