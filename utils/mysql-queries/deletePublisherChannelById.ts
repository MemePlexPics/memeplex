import { MySql2Database } from "drizzle-orm/mysql2";
import { botPublisherChannels } from "../../db/schema";
import { eq } from "drizzle-orm";

export const deletePublisherChannelById = async (db: MySql2Database<Record<string, never>>, id: number) => {
    return await db
        .delete(botPublisherChannels)
        .where(eq(botPublisherChannels.id, id))
}
