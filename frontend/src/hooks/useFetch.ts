import { useEffect, useState } from "react"
import { TUseFetch } from "./types"

export const useFetch = <GData>(
    urlCb: () => URL | RequestInfo | undefined,
    options?: {
        method?: 'GET' | 'POST'
        body?: unknown
        deps?: unknown[]
        getCached?: () => GData | null
    }
): TUseFetch<GData> => {
    const [state, setState] = useState<TUseFetch<GData>['state']>('idle')
    const [data, setData] = useState<GData>()
    const [error, setError] = useState<Error>()
    const [status, setStatus] = useState<number>()

    useEffect(() => {
        const abortController = new AbortController()

        const fetchData = async () => {
            const url = urlCb()
            if (!url) return
            setState('loading')
            try {
                const cached = options?.getCached?.()
                if (cached) {
                    setState('success')
                    setData(cached)
                    return
                }
                const reponseOptions: RequestInit = {
                    signal: abortController.signal,
                    method: options?.method || 'GET',
                }
                if (options?.method === 'POST') {
                    reponseOptions.body = options.body
                        ? JSON.stringify(options.body)
                        : undefined
                    reponseOptions.headers = {
                        'Content-Type': 'application/json',
                    }
                }
                const response = await fetch(url, reponseOptions)
                setStatus(response.status)
                if (!response.ok)
                    throw new Error("Network response wasn't ok")

                const result = await response.json()
                setState('success')
                setData(result)
            } catch (error) {
                if (!(error instanceof Error)) return
                if (error.name === 'AbortError') {
                    console.log('Request aborted')
                } else {
                    setError(error)
                    setState('error')
                }
            }
        }

        fetchData()

        return () => {
            abortController.abort()
        }
    }, options?.deps)

    // @ts-ignore
    return {
      data: state === 'success' && data ? data : null,
      error: state === 'error' && error ? error : null,
      status: status && ['success', 'error'].includes(state) ? status : null,
      state,
      isLoaded: state === 'success',
      isLoading: state === 'loading',
      isError: state === 'error',
    }
}
