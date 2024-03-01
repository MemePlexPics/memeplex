import { useRef } from "react"
import { useEventListener } from "."
import { isPortraitOrientation } from "../utils"
import { TUseInfinityScroll } from "./types"

export const useInfinityScroll: TUseInfinityScroll = (callback, options) => {
    const scrollDebounceTimer = useRef<NodeJS.Timeout>()

    const onScroll = () => {
        const remainPxToUpdate = options?.remainPxToUpdate || isPortraitOrientation()
            ? 5000
            : 150
        const element = options?.element || document.documentElement
        const isScrolledDownEnough =
            element.scrollTop + element.clientHeight
            >= element.scrollHeight - remainPxToUpdate

        if (!isScrolledDownEnough)
            return

        clearTimeout(scrollDebounceTimer.current)
        scrollDebounceTimer.current = setTimeout(() => callback(element.scrollTop), options?.debouncerMs || 300)
    }

    useEventListener('scroll', onScroll)
}
