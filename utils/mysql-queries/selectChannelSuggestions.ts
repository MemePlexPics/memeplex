import { and, eq, like } from 'drizzle-orm'
import { channelSuggestions } from '../../db/schema'
import type { TDbConnection } from '../types'

export const selectChannelSuggestions = async (
  db: TDbConnection,
  page: number,
  size: number,
  filter?: { name?: string },
) => {
  return await db
    .select({ name: channelSuggestions.name })
    .from(channelSuggestions)
    .where(
      and(
        eq(channelSuggestions.processed, 0),
        filter && filter.name ? like(channelSuggestions.name, `%${filter.name}%`) : undefined,
      ),
    )
    .orderBy(channelSuggestions.name)
    .limit(size)
    .offset((page - 1) * size)
}
