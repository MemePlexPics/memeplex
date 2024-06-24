import type { Context } from 'telegraf'
import type { TSessionInMemory, TTelegrafSession } from '.'
import type { Logger } from 'winston'
import type { Update, User } from 'telegraf/typings/core/types/typegram'
import type { Client } from '@elastic/elasticsearch'

export type TTelegrafContext<GUpdate extends Update = Update> = Context<GUpdate> & {
  from: User
} & {
  session: TTelegrafSession
  sessionInMemory: TSessionInMemory
  logger: Logger
  elastic: Client
  hasPremiumSubscription: Promise<boolean>
}
