import { useEffect, useRef } from 'react'
import { TUseEventListener } from './types'

export const useEventListener: TUseEventListener = (
    eventType,
    callback,
    element = window
) => {
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        if (element == null) return

        const handler = (e: Event) => callbackRef.current(e)
        element.addEventListener(eventType, handler)

        return () => {
            element.removeEventListener(eventType, handler)
        }
    }, [eventType, element])
}
