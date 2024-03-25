import { EState } from "../constants"

export type TTelegrafSession = {
    channel?: string
    state: EState
}
