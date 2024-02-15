import { useRef, useState } from "react"
import { Link, NavLink } from "react-router-dom"
import classnames from 'classnames'

import { HamburgerIcon } from ".."
import './style.css'
import { useClickOutside } from "../../hooks"

export const SidebarMenu = () => {
    const [isFolded, setIsFolded] = useState(true)
    const sidebarRef = useRef<HTMLDivElement>(null)

    useClickOutside(sidebarRef, () => {
        setIsFolded(true)
    })

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
                            <NavLink to='/admin'>Admin page</NavLink>
                        </li>
                        : null
                    }
                    <li>
                        <NavLink to='/channelList'>Channel list</NavLink>
                    </li>
                    <li>
                        <Link to='https://t.me/MemePlex_Pics' target="_blank">Telegram channel</Link>
                    </li>
                    <li>
                        <Link to='https://t.me/MemePlexBot' target="_blank">Telegram bot</Link>
                    </li>
                </ul>
                : null
            }
        </div>
    )
}
