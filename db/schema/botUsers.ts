import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core"

export const botUsers = mysqlTable("bot_users", {
	id: int("id").notNull(),
	user: varchar("user", { length: 255 }).notNull(),
	timestamp: int("timestamp").notNull(),
})
