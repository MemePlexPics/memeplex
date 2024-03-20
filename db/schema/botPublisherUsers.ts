import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core"

export const botPublisherUsers = mysqlTable("bot_publisher_users", {
	id: int("id").notNull(),
	user: varchar("user", { length: 255 }).notNull(),
	timestamp: int("timestamp").notNull(),
})
