import { useEffect, useRef, useState } from "react"
import { Loader, Pagination } from ".."

import './style.css'
import classNames from "classnames"
import { useEventListener } from "../../hooks"

export const PaginatedList = (props: {
    page?: number
    totalPages?: number
    isLoading?: boolean
    orientation?: 'vertical' | 'horizontal'
    className?: string
    children: React.ReactNode
    onChangePage?: (page: number) => unknown
}) => {
    const [isScrollable, setIsScrollable] = useState(false)
    const orientation = props.orientation || 'vertical'
    const listRef = useRef<HTMLDivElement>(null)
    const ulRef = useRef<HTMLUListElement>(null)

    const onWheel = (e: React.WheelEvent) => {
        if (props.orientation !== 'horizontal' || !ulRef.current) return

        ulRef.current.scrollTo({
            top: 0,
            left: ulRef.current.scrollLeft + e.deltaY,
        })
    }

    useEventListener('wheel', (e) => {
        if (props.orientation === 'horizontal'
            && e.target instanceof HTMLElement
            && e.target.closest('.paginated-list')
        ) e.preventDefault()
    }, window, { passive: false })

    useEffect(() => {
        if (props.orientation !== 'horizontal' || !ulRef.current) return
        setIsScrollable(ulRef.current.scrollWidth > ulRef.current.scrollLeft)
        console.log(ulRef.current)
      }, [])

    return <>
        <div
            className={classNames('paginated-list', orientation, props.className, { isScrollable })}
            ref={listRef}
            onWheel={onWheel}
        >
            <ul ref={ulRef}>
                {props.children}
            </ul>
            {props?.totalPages && props.totalPages > 1
                ? <Pagination
                    page={props.page || 1}
                    pagesAtTime={9}
                    pagesTotal={props.totalPages}
                    scrollToIdAfterChangePage={listRef}
                    onChangePage={props.onChangePage}
                />
                : null}
            <Loader state={props.isLoading} />
        </div>
    </>
}
