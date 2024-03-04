import { useEffect, useRef } from 'react'

export const useEventListener = <GEvent extends Event = Event>(
    eventType: keyof WindowEventMap,
    callback: (event: GEvent) => void,
    element?: HTMLElement | Window,
    options?: boolean | AddEventListenerOptions,
    dependencies?: unknown[]
) => {
    const targetElement = element || window
    const callbackRef = useRef(callback)

    useEffect(() => {
        callbackRef.current = callback
    }, [callback])

    useEffect(() => {
        const handler = (e: GEvent) => callbackRef.current(e)
        targetElement.addEventListener(eventType, handler as EventListenerOrEventListenerObject, options || {})

        return () => {
            targetElement.removeEventListener(eventType, handler as EventListenerOrEventListenerObject)
        }
    }, [eventType, element, ...(dependencies || [])])
}
