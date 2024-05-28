import { selectBotChannelById, selectBotUserById } from '../../utils/mysql-queries'
import type { TDbConnection } from '../../utils/types'

export const getPublisherUserByChannelId = async (db: TDbConnection, channelId: number) => {
  const [channel] = await selectBotChannelById(db, channelId)
  const [user] = await selectBotUserById(db, channel.userId)
  return user.id
}
