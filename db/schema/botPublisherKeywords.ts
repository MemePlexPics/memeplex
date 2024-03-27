import { mysqlTable, int, varchar, serial } from "drizzle-orm/mysql-core"

export const botPublisherKeywords = mysqlTable("bot_publisher_keywords", {
	id: int("id").autoincrement().primaryKey(),
	keyword: varchar("keyword", { length: 255 }).unique().notNull(),
	// lastCheckTimestamp: int("timestamp"),
})
