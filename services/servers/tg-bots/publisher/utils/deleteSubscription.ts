import { deletePublisherSubscription } from '../../../../../utils/mysql-queries'
import { TDbConnection } from '../../../../../utils/types'

export const deleteSubscription = async (
  db: TDbConnection,
  channelId: number,
  keywords: string[],
) => {
  await deletePublisherSubscription(db, channelId, keywords)
}
