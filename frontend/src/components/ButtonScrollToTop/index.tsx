import { faCircleChevronUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'

import { useEventListener } from '../../hooks'

import './style.css'

export const ButtonScrollToTop = () => {
  const [isActive, setIsActive] = useState(false)

  // FIX: why is it broken?
  useEventListener('scroll', () => {
    setIsActive((document.getElementById('site-content')?.scrollTop ?? 0)  > 20)
  }, document.getElementById('site-content'))

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
