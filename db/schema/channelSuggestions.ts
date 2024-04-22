import { mysqlTable, varchar, tinyint } from 'drizzle-orm/mysql-core'

export const channelSuggestions = mysqlTable('channel_suggestions', {
  name: varchar('name', { length: 255 }).primaryKey(),
  processed: tinyint('processed').default(0),
})
