import { Context } from 'telegraf'
import { TTelegrafSession } from '.'

export type TTelegrafContext = Context & {
  session: TTelegrafSession
}
