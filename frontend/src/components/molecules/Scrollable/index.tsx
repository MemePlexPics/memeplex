import stylex from '@stylexjs/stylex'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { useEventListener } from '../../../hooks'
import { applyClassNameToStyleX } from '../../../utils'

import { s } from './style'

export const Scrollable = (props: {
  orientation: 'horizontal' | 'vertical'
  children: ReactElement
}) => {
  const [isScrollable, setIsScrollable] = useState(false)
  const scrollableDivRef = useRef<HTMLDivElement>(null)
  const touchStartPosition = useRef<number | null>(null)

  const preventDefaultIfScrollTheComponent = (e: Event) => {
    if (
      props.orientation === 'horizontal' &&
      e.target instanceof HTMLElement &&
      e.target.closest('.scrollable')
    )
      e.preventDefault()
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (props.orientation !== 'horizontal' || !scrollableDivRef.current) return
    touchStartPosition.current = e.touches[0].clientX
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (props.orientation !== 'horizontal' || !scrollableDivRef.current) return
    if (touchStartPosition.current !== null) {
      const touchCurrentPosition = e.touches[0].clientX
      const deltaX = touchStartPosition.current - touchCurrentPosition
      scrollableDivRef.current.scrollTo({
        left: scrollableDivRef.current.scrollLeft + deltaX,
      })
      touchStartPosition.current = touchCurrentPosition
    }
  }

  const onTouchEnd = () => {
    touchStartPosition.current = null
  }

  const onWheel = (e: React.WheelEvent) => {
    if (props.orientation !== 'horizontal' || !scrollableDivRef.current) return
    scrollableDivRef.current.scrollTo({
      left: scrollableDivRef.current.scrollLeft + e.deltaY,
    })
  }

  useEffect(() => {
    if (props.orientation !== 'horizontal' || !scrollableDivRef.current) return
    setIsScrollable(scrollableDivRef.current.clientWidth < scrollableDivRef.current.scrollWidth)
  }, [scrollableDivRef.current?.scrollWidth])

  useEventListener(
    'wheel',
    e => {
      preventDefaultIfScrollTheComponent(e)
    },
    window,
    { passive: false },
  )
  useEventListener(
    'touchmove',
    e => {
      preventDefaultIfScrollTheComponent(e)
    },
    window,
    {
      passive: false,
    },
  )

  return (
    <div
      {...applyClassNameToStyleX(
        stylex.props(isScrollable ? s.scrollable : null, s[props.orientation]),
        'scrollable',
      )}
      ref={scrollableDivRef}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {props.children}
    </div>
  )
}
