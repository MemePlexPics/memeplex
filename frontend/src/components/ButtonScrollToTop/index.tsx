import { useState } from 'react'
import { useEventListener } from '../../hooks'
import './style.css'

export const ButtonScrollToTop = () => {
    const [isActive, setIsActive] = useState(false)

    useEventListener('scroll', () => setIsActive(document.documentElement.scrollTop > 20))

    if (!isActive) return null

    return (
        <button
            id="scroll-to-top"
            title="Go to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >^</button>
    )
}
