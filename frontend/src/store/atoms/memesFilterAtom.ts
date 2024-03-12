import { atom } from "jotai"
import { EMemeState } from "../../types/enums"

export const memesFilterAtom = atom<{
    channel?: string[]
    not?: {
        state?: EMemeState | null
    }
} | null>(null)
