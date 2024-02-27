import { useEffect, useState } from "react"
import { useAtom } from 'jotai'

import { useInfinityScroll, useNotification } from "../../../hooks"
import { EMemesOperation, pageOptionsDefault } from "./constants"
import { delay, getUrl } from "../../../utils"
import { useFetch } from "../../../hooks"
import { IGetLatest } from "../../../services/types"
import { memesAtom, pageOptionsAtom } from "../../../store/atoms"
import { ENotificationType } from "../../../components/Notification/constants"

export const useMemes = (query: string) => {
    const setNotification = useNotification()
    // TODO: get rid of it, add the operation to deps of useFetch()
    const [url, setUrl] = useState<URL>(getUrl('/getLatest'))
    const [memes, setMemes] = useAtom(memesAtom)
    const [operation, setOperation] = useState<EMemesOperation>(EMemesOperation.INIT)
    const [pageOptions, setPageOptions] = useAtom(pageOptionsAtom)
    const request = useFetch<IGetLatest>(() => url, {
        deps: [url],
        getCached:
            () => operation === EMemesOperation.INIT && memes.length
                ? {
                    result: memes,
                    totalPages: pageOptions.totalPages,
                    from: pageOptions.from,
                    to: pageOptions.to
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
            if (!pageOptions.to || (request.data.to && request?.data.to > pageOptions.to))
                setPageOptions(prev => ({ ...prev, to: request.data.to }))
        }
    }

    const searchByQuery = async () => {
        const url = getUrl('/search', {
            query,
            page: '' + pageOptions.currentPage,
        })
        setUrl(url)
    }

    const getLatest = () => {
        if (operation === EMemesOperation.INIT) return
        if (operation === EMemesOperation.IDLE) return
        if (operation === EMemesOperation.DELAY) return
        const params: Record<Exclude<EMemesOperation, EMemesOperation.IDLE | EMemesOperation.DELAY>, Record<string, string | number | undefined> | undefined> = {
            [EMemesOperation.NEXT]: { to: pageOptions.from },
            [EMemesOperation.UPDATE]: { from: pageOptions.to },
            [EMemesOperation.INIT]: undefined,
            [EMemesOperation.REINIT]: undefined,
        }
        const url = getUrl('/getLatest', params[operation])
        setUrl(url)
    }

    const getLatestUpdate = () => {
        setOperation(() => EMemesOperation.UPDATE)
    }

    const getNextPage = () => {
        if (!query) {
            if (pageOptions.totalPages > 1) return getLatest()
        } else {
            if (pageOptions.currentPage < pageOptions.totalPages) return searchByQuery()
        }
        setOperation(() => EMemesOperation.IDLE)
    }

    const retryRequest = () => {
        setOperation(() => EMemesOperation.DELAY)
        delay(2_000)
            .then(() => {
                if (operation === EMemesOperation.DELAY) setOperation(() => operation)
            })
    }

    const handleAutoUpdates = () => setInterval(() => {
        const isScrollOnTop = document.documentElement.scrollTop === 0
        if (isScrollOnTop) setOperation(() => EMemesOperation.UPDATE)
    }, 30_000)

    useEffect(() => {
        if (request.isLoaded && request.data) {
            if (operation === EMemesOperation.INIT || operation === EMemesOperation.REINIT) {
                if (request.data.totalPages > 1) {
                    setNotification({
                        text: `There are ${request.data.totalPages - 1} more pages`,
                        type: ENotificationType.OK,
                    })
                }
                setMemes(() => request.data.result)
            } else if (operation === EMemesOperation.NEXT) {
                setMemes((prev) => [...prev, ...request.data.result])
            } else if (operation === EMemesOperation.UPDATE) {
                setMemes((prev) => [...request.data.result, ...prev])
            }
            savePageOptions()
            setOperation(() => EMemesOperation.IDLE)
        } else if (request.status === 503) retryRequest()
        else if (request.state === 'idle' && memes.length)
            setOperation(() => EMemesOperation.IDLE)
    }, [request.isLoaded])

    useEffect(() => {
        if (!EMemesOperation.INIT || query !== pageOptions.query) {
            setPageOptions(() => ({ ...pageOptionsDefault, query }))
            setOperation(() => EMemesOperation.REINIT)
        }
        if (query) return
        const updateLatestInterval = handleAutoUpdates()
        return () => clearInterval(updateLatestInterval)
    }, [query])

    useEffect(() => {
        if (operation === EMemesOperation.INIT && memes.length) return
        if (operation === EMemesOperation.IDLE) return
        else if (operation === EMemesOperation.DELAY) return
        else if (operation === EMemesOperation.NEXT) getNextPage()
        else if (query) searchByQuery()
        else getLatest()
    }, [operation])

    useInfinityScroll(() => {
        setOperation(() => EMemesOperation.NEXT)
    })

    return {
        memes,
        isLoading: operation !== EMemesOperation.IDLE,
        isLoaded: request.isLoaded,
        isError: operation === EMemesOperation.IDLE && request?.state === 'error',
        getLatestUpdate,
        getNextPage,
    }
}
