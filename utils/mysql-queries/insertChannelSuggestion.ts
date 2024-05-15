import { channelSuggestions } from '../../db/schema'
import { TDbConnection } from '../types'

export const insertChannelSuggestion = async (db: TDbConnection, name: string) => {
  return await db
    .insert(channelSuggestions)
    .values({ name })
    .onDuplicateKeyUpdate({ set: { name } })
}
