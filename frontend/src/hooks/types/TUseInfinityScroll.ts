export type TUseInfinityScroll = (
  callback: (scrollTop: number) => unknown,
  options?: {
    element?: HTMLElement | null
    remainPxToUpdate?: number
    debouncerMs?: number
  },
) => void
