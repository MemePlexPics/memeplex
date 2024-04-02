import { MySql2Database } from "drizzle-orm/mysql2";
import { botPublisherSubscriptions } from "../../db/schema";
import { eq } from "drizzle-orm";

export const selectPublisherSubscriptionsByChannelId = async (
    db: MySql2Database<Record<string, never>>,
    channelId: number
) => {
    return await db
        .select({ keyword: botPublisherSubscriptions.keyword })
        .from(botPublisherSubscriptions)
        .where(eq(botPublisherSubscriptions.channelId, channelId))
}
