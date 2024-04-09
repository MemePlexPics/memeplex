import { getMysqlClient } from '../../../utils'
import { selectBlackList } from '../../../utils/mysql-queries'

// return true if text doesn't contain blocked phrases
export const blackListChecker = async (text: string) => {
  const mysql = await getMysqlClient()
  const blackList = await selectBlackList(mysql)
  await mysql.end()
  const regex = new RegExp(blackList.replace('\n', '|'), 'i')

  return !regex.test(text)
}
