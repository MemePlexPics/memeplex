import classNames from 'classnames'
import { useRef, Fragment } from 'react'

import { Loader, Pagination } from '..'
import './style.css'
import { Scrollable } from '../molecules'

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
  // TODO: move into the Home page
  const Wrapper = props.orientation === 'horizontal' ? Scrollable : Fragment

  return (
    <Wrapper orientation='horizontal'>
      <div
        className={classNames('paginated-list', orientation, props.className)}
        ref={listRef}
      >
        <ul className='list'>{props.children}</ul>
        {props.totalPages && props.totalPages > 1 ? (
          <Pagination
            page={props.page || 1}
            pagesAtTime={9}
            pagesTotal={props.totalPages}
            scrollToIdAfterChangePage={listRef}
            onChangePage={props.onChangePage}
          />
        ) : null}
        <Loader state={props.isLoading} />
      </div>
    </Wrapper>
  )
}
