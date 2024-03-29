import { MySql2Database } from "drizzle-orm/mysql2";
import { botPublisherKeywords } from "../../db/schema";
import { sql } from "drizzle-orm";

export const insertPublisherKeywords = async (
    db: MySql2Database<Record<string, never>>,
    keywordValues: typeof botPublisherKeywords.$inferInsert[]
) => {
    await db.insert(botPublisherKeywords)
        .values(keywordValues)
        .onDuplicateKeyUpdate({ set: { keyword: sql`keyword` }})
}
