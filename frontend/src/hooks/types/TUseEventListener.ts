export type TUseEventListener = (
    eventType: keyof WindowEventMap,
    callback: (event: Event) => void,
    element?: HTMLElement | Window,
    options?: boolean | AddEventListenerOptions
) => void
