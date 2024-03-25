import { Context } from "telegraf"
import { EState } from "../constants"
import { TTelegrafSession } from "."

export type TTelegrafContext = Context & {
  session: TTelegrafSession
}
