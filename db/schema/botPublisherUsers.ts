import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core"

export const botPublisherUsers = mysqlTable("bot_publisher_users", {
	id: int("id").primaryKey(),
	user: varchar("user", { length: 255 }).notNull(),
	keywordsCount: int('keywords_count'),
	timestamp: int("timestamp").notNull(),
})
