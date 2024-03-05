import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import stylex from '@stylexjs/stylex'
import { s } from "./style"

import { HamburgerIcon } from ".."
import { useClickOutside } from "../../hooks"
import { useTranslation } from "react-i18next"
import { LanguageSelector } from "../molecules"

export const SidebarMenu = () => {
    const { t } = useTranslation()
    const [isFolded, setIsFolded] = useState(true)
    const sidebarRef = useRef<HTMLDivElement>(null)
    const location = useLocation()

    useClickOutside(sidebarRef, () => {
        setIsFolded(true)
    })

    useEffect(() => {
        setIsFolded(true)
    }, [location])

    return (
        <div
            {...stylex.props(s.sidebar, isFolded ? null : s.isActive)}
            ref={sidebarRef}
        >
            <HamburgerIcon
                isActive={isFolded} onClick={() => setIsFolded(!isFolded)}
                {...stylex.props(s.hamburger)}
            />
            {!isFolded
                ? <>
                    <ul {...stylex.props(s.list, s.menu)}>
                        {localStorage.getItem('isAdmin') === '1'
                            ? <li>
                                <NavLink to='/admin' {...stylex.props(s.link)}>{t('page.admin')}</NavLink>
                            </li>
                            : null
                        }
                        <li>
                            <NavLink to='/channelList' {...stylex.props(s.link)}>{t('page.channelList')}</NavLink>
                        </li>
                        <li>
                            <Link to='https://t.me/MemePlex_Pics' target="_blank" {...stylex.props(s.link)}>{t('page.telegramChannel')}</Link>
                        </li>
                        <li>
                            <Link to='https://t.me/MemePlexBot' target="_blank" {...stylex.props(s.link)}>{t('page.telegramBot')}</Link>
                        </li>
                        <li>
                            <NavLink to='/about' {...stylex.props(s.link)}>{t('page.about')}</NavLink>
                        </li>
                    </ul>
                    <LanguageSelector
                        {...stylex.props(s.languageSelector)}
                        languageOpetions={{
                            ru: 'Русский',
                            en: 'English',
                        }}
                    />
                </>
                : null
            }
        </div>
    )
}
