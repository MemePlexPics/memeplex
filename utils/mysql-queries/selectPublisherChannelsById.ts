import { MySql2Database } from "drizzle-orm/mysql2";
import { botPublisherChannels } from "../../db/schema";
import { inArray } from "drizzle-orm";

export const selectPublisherChannelsById = async (db: MySql2Database<Record<string, never>>, channelIds: number[]) => {
    return await db
        .select()
        .from(botPublisherChannels)
        .where(inArray(botPublisherChannels.id, channelIds))
}
