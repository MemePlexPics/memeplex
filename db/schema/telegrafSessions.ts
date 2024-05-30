import { json, mysqlTable, varchar } from 'drizzle-orm/mysql-core'
import type { TTelegrafSession } from '../../services/servers/tg-bots/publisher/types'

export const telegrafSessions = mysqlTable('telegraf_sessions', {
  key: varchar('key', { length: 32 }).$type<`${number}:${number}`>().primaryKey(),
  session: json('session').$type<TTelegrafSession>(),
})
