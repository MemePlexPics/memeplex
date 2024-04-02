import { MySql2Database } from "drizzle-orm/mysql2";
import { botPublisherChannels, botPublisherUsers } from "../../db/schema";
import { getTelegramUser } from "../../services/servers/tg-bots/utils";
import { sql } from "drizzle-orm";

export const insertPublisherUser = async (db: MySql2Database<Record<string, never>>, values: typeof botPublisherUsers.$inferInsert) => {
  await db.insert(botPublisherUsers).values(values).onDuplicateKeyUpdate({ set: { id: sql`id` } })
}
