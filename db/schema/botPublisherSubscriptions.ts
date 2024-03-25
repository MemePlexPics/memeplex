import { mysqlTable, int, serial, unique } from "drizzle-orm/mysql-core"
import { botPublisherChannels, botPublisherKeywords } from "."

export const botPublisherSubscriptions = mysqlTable("bot_publisher_subscriptions", {
	id: serial("id").primaryKey(),
	keywordId: int("keyword_id")
		.notNull()
		.references(() => botPublisherKeywords.id, {
			onDelete: "restrict",
			onUpdate: "restrict"
		}),
	channelId: int("channel_id")
		.notNull()
		.references(() => botPublisherChannels.id, {
			onDelete: "restrict",
			onUpdate: "restrict"
		}),
}, (t) => ({
	unq: unique('keyword_id-channel_id').on(t.keywordId, t.channelId)
}))
