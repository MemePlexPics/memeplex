import { EState } from "../constants"

export type TTelegrafSession = {
    channel?: {
        name: string
        id?: number
    }
    state: EState
}
