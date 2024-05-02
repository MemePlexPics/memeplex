import { selectPublisherChannelById, selectPublisherUserById } from '../../utils/mysql-queries'
import { TDbConnection } from '../../utils/types'

export const getPublisherUserByChannelId = async (db: TDbConnection, channelId: number) => {
  const [channel] = await selectPublisherChannelById(db, channelId)
  const [user] = await selectPublisherUserById(db, channel.userId)
  return user.id
}
