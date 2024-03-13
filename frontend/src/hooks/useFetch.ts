import { useEffect, useState } from 'react'
import { TUseFetch } from './types'

export const useFetch = <GData>(
  urlCb: () => URL | RequestInfo | undefined,
  options?: {
    method?: 'GET' | 'POST'
    body?: unknown
    deps?: unknown[]
    getCached?: () => GData | null
  },
): TUseFetch<GData> => {
  const [state, setState] = useState<TUseFetch<GData>['state']>('idle')
  const [data, setData] = useState<GData>()
  const [error, setError] = useState<Error>()
  const [status, setStatus] = useState<number>()
  const isLoaded = state === 'success'
  const isLoading = state === 'loading'
  const isError = state === 'error'

  useEffect(() => {
    const abortController = new AbortController()

    const fetchData = async () => {
      const url = urlCb()
      if (!url) return
      setState('loading')
      try {
        const cached = options?.getCached?.()
        if (cached) {
          setData(cached)
          setState('success')
          return
        }
        const reponseOptions: RequestInit = {
          signal: abortController.signal,
          method: options?.method || 'GET',
        }
        if (options?.method === 'POST') {
          reponseOptions.body = options.body ? JSON.stringify(options.body) : undefined
          reponseOptions.headers = {
            'Content-Type': 'application/json',
          }
        }
        const response = await fetch(url, reponseOptions)
        setStatus(response.status)
        if (!response.ok) throw new Error("Network response wasn't ok")

        const result = await response.json()
        setData(result)
        setState('success')
      } catch (error) {
        if (!(error instanceof Error)) return
        if (error.name === 'AbortError') {
          return
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
    data: isLoaded && data ? data : null,
    error: isError && error ? error : null,
    status: status && ['success', 'error'].includes(state) ? status : null,
    state,
    isLoaded,
    isLoading,
    isError,
  }
}
