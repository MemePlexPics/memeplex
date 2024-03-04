import { ReactElement, useEffect, useRef, useState } from "react"
import * as stylex from '@stylexjs/stylex'
import { s } from "./style"

import { useEventListener } from "../../../hooks"
import { applyClassNameToStyleX } from "../../../utils"
import { getXPosition } from "./utils"

export const Scrollable = (props: {
    orientation: 'horizontal' | 'vertical'
    children: ReactElement
}) => {
    const [isScrollable, setIsScrollable] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [dragStartX, setDragStartX] = useState(0)
    const [scrollLeft, setScrollLeft] = useState(0)
    const scrollableDivRef = useRef<HTMLDivElement>(null)

    const preventDefaultIfScrollTheComponent = (e: Event) => {
        if (props.orientation === 'horizontal'
            && e.target instanceof HTMLElement
            && e.target.closest('.scrollable')
        ) e.preventDefault()
    }

    const handleDragStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        setIsDragging(true)
        if (!(event instanceof MouseEvent) || !(event instanceof TouchEvent))
            return
        const xPosition = getXPosition(event)
        if (xPosition) setDragStartX(xPosition)
    }

    const handleDragEnd = () => {
        setIsDragging(false)
        setScrollLeft(scrollableDivRef.current?.scrollLeft || 0)
    }

    const handleDragMove = (event: MouseEvent | TouchEvent) => {
        if (!isDragging)
            return
        const currentX = getXPosition(event)
        const distance = dragStartX - currentX
        if (scrollableDivRef.current !== null)
            scrollableDivRef.current.scrollTo({
                top: 0,
                left: scrollLeft + distance,
            })
    }

    const onWheel = (e: React.WheelEvent) => {
        if (props.orientation !== 'horizontal' || !scrollableDivRef.current)
            return
        scrollableDivRef.current.scrollTo({
            left: scrollableDivRef.current.scrollLeft + e.deltaY,
        })
    }

    useEffect(() => {
        if (props.orientation !== 'horizontal' || !scrollableDivRef.current)
            return
        setIsScrollable(scrollableDivRef.current.clientWidth < scrollableDivRef.current.scrollWidth)
    }, [scrollableDivRef.current?.scrollWidth])

    useEventListener('mousemove', handleDragMove, window, {}, [isDragging])
    useEventListener('touchmove', handleDragMove, window, {}, [isDragging])
    useEventListener('mouseup', handleDragEnd, window, {}, [isDragging])
    useEventListener('touchend', handleDragEnd, window, {}, [isDragging])

    useEventListener('touchstart', (e) => preventDefaultIfScrollTheComponent(e), window, { passive: false })
    useEventListener('wheel', (e) => preventDefaultIfScrollTheComponent(e), window, { passive: false })

    return (
        <div
            {...applyClassNameToStyleX(stylex.props(isScrollable ? s.scrollable : null, s[props.orientation]), 'scrollable')}
            ref={scrollableDivRef}
            onDragStart={e => e.preventDefault()}
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onWheel={onWheel}
        >
            {props.children}
        </div>
    )
}
