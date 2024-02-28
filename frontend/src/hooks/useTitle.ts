import { useAtomValue, useSetAtom } from "jotai"
import { titleAtom } from "../store/atoms"
import { useEffect } from "react"
import { getTitleAtom } from "../store/atoms/getters"

export const useTitle = (titles: string[]) => {
    const title = useAtomValue(getTitleAtom)
    const setTitle = useSetAtom(titleAtom)

    useEffect(() => {
        setTitle(titles)

        return () => setTitle([])
    }, [])

    return {
        title,
        setTitle,
    }
}
