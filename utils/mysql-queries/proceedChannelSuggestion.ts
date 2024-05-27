import { eq } from 'drizzle-orm'
import { channelSuggestions } from '../../db/schema'
import type { TDbConnection } from '../types'

export const proceedChannelSuggestion = async (db: TDbConnection, channel: string) => {
  await db
    .update(channelSuggestions)
    .set({ processed: 1 })
    .where(eq(channelSuggestions.name, channel))
}
