import { channels } from '../../db/schema'
import { and, asc, desc, eq, like } from 'drizzle-orm'
import { TDbConnection } from '../types'

export const getChannels = async (
  db: TDbConnection,
  page: number,
  size: number,
  { onlyAvailable, name }: { onlyAvailable: string; name: string }
) => {
  return await db
    .select({
      name: channels.name,
      availability: channels.availability
    })
    .from(channels)
    .where(
      and(
        onlyAvailable === 'true' ? eq(channels.availability, 1) : undefined,
        name && /[0-9a-zA-Z_]+/.test(name)
          ? like(channels.name, `%${name}%`) // LIKE is case-insensetive in MariaDB
          : undefined
      )
    )
    .orderBy(desc(channels.availability), asc(channels.name))
    .limit(size)
    .offset((page - 1) * size)
}
