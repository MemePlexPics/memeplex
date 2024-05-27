import type { Context } from 'telegraf'
import type { TTelegrafSession } from '.'

export type TTelegrafContext = Context & {
  session: TTelegrafSession
}
