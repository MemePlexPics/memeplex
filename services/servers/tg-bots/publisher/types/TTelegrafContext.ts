import { Context } from 'telegraf'
import { TTelegrafSession } from '.'
import { Logger } from 'winston'

export type TTelegrafContext = Context & {
  session: TTelegrafSession
  logger: Logger
  hasPremiumSubscription: boolean
}
