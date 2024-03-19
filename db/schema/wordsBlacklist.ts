import { mysqlTable, text } from "drizzle-orm/mysql-core"

export const wordsBlacklist = mysqlTable("words_blacklist", {
	words: text("words"),
})
