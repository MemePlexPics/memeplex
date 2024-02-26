import { useRef } from "react"
import { Loader, Pagination } from ".."

import './style.css'

export const PaginatedList = (props: {
    page?: number
    totalPages?: number
    isLoading?: boolean
    children: React.ReactNode
    onChangePage?: (page: number) => unknown
}) => {
    const listRef = useRef<HTMLDivElement>(null)

    return <>
        <div className='paginated-list' ref={listRef}>
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
    </>
}
