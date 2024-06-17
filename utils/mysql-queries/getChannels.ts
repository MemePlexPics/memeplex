import { channels } from '../../db/schema'
import { and, isNull, like } from 'drizzle-orm'
import type { TDbConnection } from '../types'

export const getChannels = async (
  db: TDbConnection,
  page: number,
  size: number,
  { onlyAvailable, name }: { onlyAvailable: string; name: string },
) => {
  return await db
    .select({
      name: channels.name,
      status: channels.status,
    })
    .from(channels)
    .where(
      and(
        onlyAvailable === 'true' ? isNull(channels.status) : undefined,
        name && /[0-9a-zA-Z_]+/.test(name)
          ? like(channels.name, `%${name}%`) // LIKE is case-insensetive in MariaDB
          : undefined,
      ),
    )
    .orderBy(channels.status, channels.name)
    .limit(size)
    .offset((page - 1) * size)
}
