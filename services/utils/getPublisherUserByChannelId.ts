import { selectPublisherChannelById, selectPublisherUserById } from '../../utils/mysql-queries'

export const getPublisherUserByChannelId = async (db, channelId: number) => {
  const [channel] = await selectPublisherChannelById(db, channelId)
  const [user] = await selectPublisherUserById(db, channel.userId)
  return user.id
}
