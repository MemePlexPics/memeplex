import { Context } from 'telegraf'
import { TStateObject, TTelegrafSession } from '.'

export type TTelegrafContext = Context & {
  session: TTelegrafSession
  sessionInMemory?: TStateObject
}
