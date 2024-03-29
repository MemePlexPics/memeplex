import { ChatFromGetChat } from "telegraf/typings/core/types/typegram"
import { EState } from "../constants"

export type TTelegrafSession = {
    channel?: {
        name: string
        id?: number
        type: ChatFromGetChat['type']
    }
    state: EState
}
