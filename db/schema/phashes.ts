import { mysqlTable, varchar } from 'drizzle-orm/mysql-core'

export const phashes = mysqlTable('phashes', {
  phash: varchar('phash', { length: 255 }).primaryKey(),
})
