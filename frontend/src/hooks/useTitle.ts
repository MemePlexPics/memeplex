import { useSetAtom } from "jotai"
import { titleAtom } from "../store/atoms"
import { useEffect } from "react"

export const useTitle = (titles: string[]) => {
    const setTitle = useSetAtom(titleAtom)

    useEffect(() => {
        setTitle(titles)

        return () => setTitle([])
    }, [])
}
