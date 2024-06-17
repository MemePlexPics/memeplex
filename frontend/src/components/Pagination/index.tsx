import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { getEndPageNumbers } from './helpers'

import { Button } from '@/components/atoms'

import './style.css'

export type PaginationProps = {
  page: number
  pagesTotal: number
  pagesAtTime: number
  className?: string
  scrollToIdAfterChangePage?: React.RefObject<HTMLDivElement>
  onChangePage?: (page: number) => unknown
}

export const Pagination = (props: PaginationProps) => {
  const { t } = useTranslation()
  const pageRange = getEndPageNumbers(props.page, props.pagesAtTime, props.pagesTotal)

  const onChangePage = (page: number) => {
    if (props.scrollToIdAfterChangePage?.current) {
      props.scrollToIdAfterChangePage.current.scrollIntoView({ behavior: 'smooth' })
    }
    props.onChangePage?.(page)
  }

  const PageButtons = () => {
    const buttons = []
    for (let page = pageRange.from; page <= pageRange.to; page++) {
      buttons.push(
        <Button
          key={page}
          className='page number'
          isActive={page === props.page}
          onClick={() => {
            onChangePage(page)
          }}
        >
          {page}
        </Button>,
      )
    }

    return buttons
  }

  return (
    <div className={classNames(['pagination', props.className])}>
      <Button
        className={'page neigbour'}
        onClick={() => {
          onChangePage(props.page - 1)
        }}
        disabled={props.page === 1}
      >
        {t('button.back')}
      </Button>

      <Button
        className={'page number'}
        onClick={() => {
          onChangePage(1)
        }}
        hidden={pageRange.from === 1}
      >
        1
      </Button>

      <PageButtons />

      <Button
        className={'page number'}
        onClick={() => {
          onChangePage(props.pagesTotal)
        }}
        hidden={pageRange.to === props.pagesTotal}
      >
        {props.pagesTotal}
      </Button>

      <Button
        className={'page neigbour'}
        onClick={() => {
          onChangePage(props.page + 1)
        }}
        disabled={props.page === props.pagesTotal}
      >
        {t('button.next')}
      </Button>
    </div>
  )
}
