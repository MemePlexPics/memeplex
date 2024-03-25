import { Context } from "telegraf"
import { EState } from "../constants"

export type TTelegrafContext = Context & {
    session: {
      channel?: string
      state: EState
    }
  }
