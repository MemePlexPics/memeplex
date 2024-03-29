import { MySql2Database } from "drizzle-orm/mysql2";
import { botPublisherSubscriptions } from "../../db/schema";
import { eq } from "drizzle-orm";

export const deletePublisherSubscriptionByKeyword = async (
    db: MySql2Database<Record<string, never>>,
    keyword: string
) => {
    await db
        .delete(botPublisherSubscriptions)
        .where(eq(botPublisherSubscriptions.keyword, keyword))
}
