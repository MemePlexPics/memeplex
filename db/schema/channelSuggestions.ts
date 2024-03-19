import { mysqlTable, varchar, boolean } from "drizzle-orm/mysql-core"

export const channelSuggestions = mysqlTable("channel_suggestions", {
	name: varchar("name", { length: 255 }).notNull(),
	processed: boolean("processed").default(false),
})
