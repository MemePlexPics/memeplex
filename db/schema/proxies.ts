import { mysqlTable, int, varchar, unique, boolean, datetime } from "drizzle-orm/mysql-core"

export const proxies = mysqlTable("proxies", {
	id: int("id").autoincrement().notNull(),
	address: varchar("address", { length: 255 }).notNull(),
	protocol: varchar("protocol", { length: 10 }).notNull(),
	availability: boolean("availability").notNull(),
	anonymity: varchar("anonymity", { length: 12 }),
	ocrKey: varchar("ocr_key", { length: 255 }).default('NULL'),
	speed: int("speed"),
	lastActivityDatetime: datetime("last_activity_datetime", { mode: 'string'}).notNull(),
	lastCheckDatetime: datetime("last_check_datetime", { mode: 'string'}).notNull(),
},
(table) => {
	return {
		uniqueAddressProtocol: unique("unique_address_protocol").on(table.address, table.protocol),
	}
})
