import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core"
import { botPublisherUsers } from "."

export const botPublisherChannels = mysqlTable("bot_publisher_channels", {
	id: int("id").notNull(),
	userId: int("user_id")
		.notNull()
		.references(() => botPublisherUsers.id, {
			onDelete: "restrict",
			onUpdate: "restrict"
		}),
	username: varchar("username", { length: 255 }).notNull(),
	title: varchar("title", { length: 255 }).notNull(),
	subscribers: int('subscribers').notNull(),
	timestamp: int("timestamp").notNull(),
})
