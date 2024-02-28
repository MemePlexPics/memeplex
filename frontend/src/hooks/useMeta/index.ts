import { useEffect } from "react"
import { setMetaProperty } from "./utils"

export const useMeta = (meta: { name: string, content: string }[]) => {
    useEffect(() => {
        meta.forEach(({ name, content }) => setMetaProperty(name, content))
        return () => {
            meta.forEach(({ name }) => setMetaProperty(name, ''))
        }
    }, [meta])
}
