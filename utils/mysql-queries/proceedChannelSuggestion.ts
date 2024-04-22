import { eq } from 'drizzle-orm'
import { channelSuggestions } from '../../db/schema'
import { TDbConnection } from '../types'

export const proceedChannelSuggestion = async (db: TDbConnection, channel: string) => {
  await db
    .update(channelSuggestions)
    .set({ processed: true })
    .where(eq(channelSuggestions.name, channel))
}
