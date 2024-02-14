export type TUseInfinityScroll = (
    callback: (scrollTop: number) => unknown,
    options?: {
        element?: HTMLElement
        remainPxToUpdate?: number
        debouncerMs?: number
    }
) => void
