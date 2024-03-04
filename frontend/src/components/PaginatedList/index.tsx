import { useRef } from "react"
import { Loader, Pagination } from ".."

import './style.css'
import classNames from "classnames"
import { Scrollable } from "../molecules"

export const PaginatedList = (props: {
    page?: number
    totalPages?: number
    isLoading?: boolean
    orientation?: 'vertical' | 'horizontal'
    className?: string
    children: React.ReactNode
    onChangePage?: (page: number) => unknown
}) => {
    const orientation = props.orientation || 'vertical'
    const listRef = useRef<HTMLDivElement>(null)

    return (
        <Scrollable orientation="horizontal">
            <div
                className={classNames('paginated-list', orientation, props.className)}
                ref={listRef}
            >
                <ul>
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
        </Scrollable>
    )
}
