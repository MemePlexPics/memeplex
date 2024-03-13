import { faCircleChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

import { useEventListener } from '../../hooks'

import './style.css'

export const ButtonScrollToTop = () => {
  const [isActive, setIsActive] = useState(false)

  useEventListener('scroll', () => {
    setIsActive(document.documentElement.scrollTop > 20)
  })

  if (!isActive) return null

  return (
    <FontAwesomeIcon
      id='scroll-to-top'
      icon={faCircleChevronUp}
      title='Go to top'
      onClick={() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
    />
  )
}
