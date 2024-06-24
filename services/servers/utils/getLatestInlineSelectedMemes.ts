import type { Client } from '@elastic/elasticsearch'
import { getDbConnection } from '../../../utils'
import { selectLatestInlineSelectedMemes } from '../../../utils/mysql-queries'
import { getMemesByIds } from './getMemesByIds'

export const getLatestInlineSelectedMemes = async (
  client: Client,
  abortController: AbortController,
) => {
  const db = await getDbConnection()
  const latestMemes = await selectLatestInlineSelectedMemes(db, 15)
  await db.close()
  const latestMemeIds = latestMemes.reduce<string[]>((acc, meme) => {
    if (meme.selectedId) acc.push(meme.selectedId)
    return acc
  }, [])
  const memeEntities = await getMemesByIds(client, latestMemeIds, abortController)

  return memeEntities
}
