import { MySql2Database } from "drizzle-orm/mysql2";
import { botPublisherKeywords } from "../../db/schema";

export const getPublisherKeywords = (db: MySql2Database<Record<string, never>>) => {
    return db
        .select()
        .from(botPublisherKeywords)
}
