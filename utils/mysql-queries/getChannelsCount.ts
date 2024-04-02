import { MySql2Database } from 'drizzle-orm/mysql2'
import { channels } from '../../db/schema'
import { and, count, eq, like } from 'drizzle-orm'

export const getChannelsCount = async (
  db: MySql2Database<Record<string, never>>,
  { onlyAvailable, name }: { onlyAvailable: string; name: string }
) => {
  return await db
    .select({ values: count() })
    .from(channels)
    .where(
      and(
        onlyAvailable === 'true' ? eq(channels.availability, 1) : undefined,
        name && /[0-9a-zA-Z_]+/.test(name)
          ? like(channels.name, `%${name}%`) // LIKE is case-insensetive in MariaDB
          : undefined
      )
    )
}
