import { getDbConnection } from '../../../utils'
import { selectBlackList } from '../../../utils/mysql-queries'

// return true if text doesn't contain blocked phrases
export const blackListChecker = async (text: string) => {
  const db = await getDbConnection()
  const blackListRows = await selectBlackList(db)
  if (!blackListRows.length || !blackListRows[0].words) {
    throw new Error(
      'There is no blacklist in the database. Please add them to the words cell from the words_blacklist table (one row, separated by lines)',
    )
  }
  await db.close()
  const blackList = blackListRows[0].words
  const regex = new RegExp(blackList.replace('\n', '|'), 'i')

  return !regex.test(text)
}
