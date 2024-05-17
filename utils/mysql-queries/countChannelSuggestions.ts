import { and, count, eq, like } from 'drizzle-orm'
import { TDbConnection } from '../types'
import { channelSuggestions } from '../../db/schema'

export const countChannelSuggestions = async (db: TDbConnection, { name }: { name?: string }) => {
  const [response] = await db
    .select({ values: count() })
    .from(channelSuggestions)
    .where(
      and(
        eq(channelSuggestions.processed, 0),
        name && /[0-9a-zA-Z_]+/.test(name) ? like(channelSuggestions.name, `%${name}%`) : undefined,
      ),
    )
  return response.values
}
