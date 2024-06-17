import { channels } from '../../db/schema'
import { and, count, isNull, like } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const getChannelsCount = async (
  db: TDbConnection,
  { onlyAvailable, name }: { onlyAvailable: string; name: string },
) => {
  const [response] = await db
    .select({ values: count() })
    .from(channels)
    .where(
      and(
        onlyAvailable === 'true' ? isNull(channels.status) : undefined,
        name && /[0-9a-zA-Z_]+/.test(name)
          ? like(channels.name, `%${name}%`) // LIKE is case-insensetive in MariaDB
          : undefined,
      ),
    )
  return response.values
}
