import type { Context } from 'telegraf'
import type { TTelegrafSession } from '.'
import type { Logger } from 'winston'

export type TTelegrafContext = Context & {
  session: TTelegrafSession
  logger: Logger
  hasPremiumSubscription: Promise<boolean>
}
