import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useRef, useState } from 'react'

import { useTranslation } from 'react-i18next'

import { ENotificationType } from '../../../components/Notification/constants'
import { useInfinityScroll, useNotification, useFetch } from '../../../hooks'

import { IGetLatest } from '../../../services/types'
import { memesAtom, memesFilterAtom, pageOptionsAtom } from '../../../store/atoms'
import { delay, getUrl } from '../../../utils'

import { latestUpdateTime } from '../constants'

import { EMemesOperation, pageOptionsDefault } from './constants'

export const useMemes = (query: string) => {
  const { t } = useTranslation()
  const setNotification = useNotification()
  // TODO: get rid of it, add the operation to deps of useFetch()
  const [url, setUrl] = useState<URL>(getUrl('/getLatest'))
  const [memes, setMemes] = useAtom(memesAtom)
  const [operation, setOperation] = useState<EMemesOperation>(EMemesOperation.INIT)
  const [pageOptions, setPageOptions] = useAtom(pageOptionsAtom)
  const memeFilters = useAtomValue(memesFilterAtom)
  const stateBeforeDelay = useRef<EMemesOperation>()
  const request = useFetch<IGetLatest>(() => url, {
    deps: [url],
    getCached: () =>
      operation === EMemesOperation.INIT && memes.length
        ? {
            result: memes,
            totalPages: pageOptions.totalPages,
            from: pageOptions.from,
            to: pageOptions.to,
          }
        : null,
  })

  const savePageOptions = () => {
    if (request.state !== 'success') return
    if (query) {
      setPageOptions(() => ({
        ...pageOptions,
        totalPages: request.data.totalPages,
        currentPage: pageOptions.currentPage + 1,
      }))
    } else {
      if (operation !== EMemesOperation.UPDATE)
        setPageOptions(prev => ({ ...prev, totalPages: request.data.totalPages }))
      if (!pageOptions.from || (request.data.from && request.data.from < pageOptions.from))
        setPageOptions(prev => ({ ...prev, from: request.data.from }))
      if (!pageOptions.to || (request.data.to && request.data.to > pageOptions.to))
        setPageOptions(prev => ({ ...prev, to: request.data.to }))
    }
  }

  const searchByQuery = () => {
    const url = getUrl('/search', {
      query,
      page: '' + pageOptions.currentPage,
    })
    setUrl(url)
  }

  const getLatest = () => {
    if (operation === EMemesOperation.IDLE) return
    if (operation === EMemesOperation.DELAY) return
    const paramsByOperation: Record<
      Exclude<EMemesOperation, EMemesOperation.IDLE | EMemesOperation.DELAY>,
      Record<string, string | number | undefined> | undefined
    > = {
      [EMemesOperation.NEXT]: { to: pageOptions.from },
      [EMemesOperation.UPDATE]: { from: pageOptions.to },
      [EMemesOperation.INIT]: undefined,
      [EMemesOperation.REINIT]: undefined,
    }
    const params = {
      ...paramsByOperation[operation],
    }
    if (memeFilters) params.filters = JSON.stringify(memeFilters)
    const url = getUrl('/getLatest', params)
    setUrl(url)
  }

  const getLatestUpdate = () => {
    setOperation(() => EMemesOperation.UPDATE)
  }

  const getNextPage = () => {
    if (!query) {
      if (pageOptions.totalPages > 1) {
        getLatest()
        return
      }
    } else {
      if (pageOptions.currentPage <= pageOptions.totalPages) {
        searchByQuery()
        return
      }
    }
    setOperation(() => EMemesOperation.IDLE)
  }

  const handleAutoUpdates = () =>
    setInterval(() => {
      const isScrollOnTop = document.getElementById('site-content')?.scrollTop === 0
      if (isScrollOnTop) setOperation(() => EMemesOperation.UPDATE)
    }, latestUpdateTime)

  useEffect(() => {
    if (request.isLoaded && request.data) {
      if (operation === EMemesOperation.INIT || operation === EMemesOperation.REINIT) {
        if (request.data.totalPages > 1) {
          setNotification({
            text: t('notification.pagesLeft', { number: request.data.totalPages }),
            type: ENotificationType.OK,
          })
        }
        setMemes(() => request.data.result)
      } else if (operation === EMemesOperation.NEXT) {
        setMemes(prev => [...prev, ...request.data.result])
      } else if (operation === EMemesOperation.UPDATE) {
        setMemes(prev => [...request.data.result, ...prev])
      }
      savePageOptions()
      setOperation(() => EMemesOperation.IDLE)
    } else if (request.status === 503) {
      stateBeforeDelay.current = operation
      setOperation(EMemesOperation.DELAY)
    } else if (request.state === 'idle' && memes.length) {
      setOperation(() => EMemesOperation.IDLE)
    }
  }, [request.isLoading])

  useEffect(() => {
    if (operation !== EMemesOperation.INIT || query !== pageOptions.query) {
      setPageOptions(() => ({ ...pageOptionsDefault, query }))
      setOperation(() => EMemesOperation.REINIT)
    }
    if (query) return
    const updateLatestInterval = handleAutoUpdates()
    return () => {
      clearInterval(updateLatestInterval)
    }
  }, [query])

  useEffect(() => {
    setPageOptions(() => ({ ...pageOptionsDefault, query }))
    setOperation(() => EMemesOperation.REINIT)
  }, [memeFilters])

  useEffect(() => {
    if (operation === EMemesOperation.INIT && memes.length) return
    if (operation === EMemesOperation.IDLE) return
    if (operation === EMemesOperation.DELAY) {
      void delay(2_000).then(() => {
        if (stateBeforeDelay.current) setOperation(stateBeforeDelay.current)
      })
      return
    }
    if (operation === EMemesOperation.NEXT) getNextPage()
    else if (query) searchByQuery()
    else getLatest()
  }, [operation])

  useInfinityScroll(
    () => {
      setOperation(() => EMemesOperation.NEXT)
    },
    { element: document.getElementById('site-content') },
  )

  return {
    memes,
    isLoading: operation !== EMemesOperation.IDLE,
    isLoaded: request.isLoaded,
    isError: operation === EMemesOperation.IDLE && request.state === 'error',
    getLatestUpdate,
    getNextPage,
  }
}
