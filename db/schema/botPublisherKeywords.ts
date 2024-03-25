import { mysqlTable, int, varchar, serial } from "drizzle-orm/mysql-core"

export const botPublisherKeywords = mysqlTable("bot_publisher_keywords", {
	id: serial("id").primaryKey(),
	keyword: varchar("keyword", { length: 255 }).unique().notNull(),
	// lastCheckTimestamp: int("timestamp"),
})
