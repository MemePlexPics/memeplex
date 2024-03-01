import { useEffect, useRef, useState } from "react"
import { Link, NavLink, useLocation } from "react-router-dom"
import classnames from 'classnames'

import { HamburgerIcon } from ".."
import './style.css'
import { useClickOutside } from "../../hooks"
import { useTranslation } from "react-i18next"

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
            className={classnames('sidebar', { isActive: !isFolded })}
            ref={sidebarRef}
        >
            <HamburgerIcon isActive={isFolded} onClick={() => setIsFolded(!isFolded)} />
            {!isFolded
                ? <ul className="sidebar-menu">
                    {localStorage.getItem('isAdmin') === '1'
                        ? <li>
                            <NavLink to='/admin'>{t('page.admin')}</NavLink>
                        </li>
                        : null
                    }
                    <li>
                        <NavLink to='/channelList'>{t('page.channelList')}</NavLink>
                    </li>
                    <li>
                        <Link to='https://t.me/MemePlex_Pics' target="_blank">{t('page.telegramChannel')}</Link>
                    </li>
                    <li>
                        <Link to='https://t.me/MemePlexBot' target="_blank">{t('page.telegramBot')}</Link>
                    </li>
                    <li>
                        <NavLink to='/about'>{t('page.about')}</NavLink>
                    </li>
                </ul>
                : null
            }
        </div>
    )
}
