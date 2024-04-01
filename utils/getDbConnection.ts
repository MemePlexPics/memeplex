import { drizzle } from "drizzle-orm/mysql2"
import { getMysqlClient } from "."

export const getDbConnection = async () => {
    const db = drizzle(await getMysqlClient())
    return db
}
