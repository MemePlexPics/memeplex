import { mysqlTable, int, varchar, unique, datetime, tinyint } from 'drizzle-orm/mysql-core'

export const proxies = mysqlTable(
  'proxies',
  {
    id: int('id').autoincrement().primaryKey(),
    address: varchar('address', { length: 255 }).notNull(),
    protocol: varchar('protocol', { length: 10 }).notNull(),
    availability: tinyint('availability').notNull(),
    anonymity: varchar('anonymity', { length: 12 }),
    ocrKey: varchar('ocr_key', { length: 255 }),
    speed: int('speed'),
    lastActivityDatetime: datetime('last_activity_datetime', {
      mode: 'string',
    }).notNull(),
    lastCheckDatetime: datetime('last_check_datetime', {
      mode: 'string',
    }).notNull(),
  },
  table => {
    return {
      uniqueAddressProtocol: unique('unique_address_protocol').on(table.address, table.protocol),
    }
  },
)
