import type { Context } from 'telegraf'
import type { TTelegrafSession } from '.'
import type { Logger } from 'winston'
import type { Update } from 'telegraf/typings/core/types/typegram'
import type { Client } from '@elastic/elasticsearch'

export type TTelegrafContext<GUpdate extends Update = Update> = Context<GUpdate> & {
  session: TTelegrafSession
  logger: Logger
  elastic: Client
  hasPremiumSubscription: Promise<boolean>
}
