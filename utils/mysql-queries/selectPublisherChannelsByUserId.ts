import { MySql2Database } from "drizzle-orm/mysql2";
import { botPublisherChannels } from "../../db/schema";
import { eq } from "drizzle-orm";

export const selectPublisherChannelsByUserId = async (
    db: MySql2Database<Record<string, never>>,
    id: number
) => {
    return await db
        .select()
        .from(botPublisherChannels)
        .where(eq(botPublisherChannels.userId, id))
}
