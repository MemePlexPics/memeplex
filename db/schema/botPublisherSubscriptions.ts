import { mysqlTable, int, serial, unique, foreignKey, bigint } from "drizzle-orm/mysql-core"
import { botPublisherChannels, botPublisherKeywords } from "."

export const botPublisherSubscriptions = mysqlTable("bot_publisher_subscriptions", {
	id: int("id").autoincrement().primaryKey(),
	keywordId: int("keyword_id").notNull(),
	channelId: bigint("channel_id", { mode: 'number' }).notNull(),
}, (table) => ({
	unique: unique('keyword_id-channel_id').on(table.keywordId, table.channelId),
	keywordReference: foreignKey({
		columns: [table.keywordId],
		foreignColumns: [botPublisherKeywords.id],
		name: 'bot_publisher_subscriptions_keyword_id_fk',
	}),
	channelReference: foreignKey({
		columns: [table.channelId],
		foreignColumns: [botPublisherChannels.id],
		name: 'bot_publisher_subscriptions__channel_id_fk',
	}),
}))
