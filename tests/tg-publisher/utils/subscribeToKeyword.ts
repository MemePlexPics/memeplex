import { i18n } from '../../../services/servers/tg-bots/pics/i18n'
import { getDbConnection } from '../../../utils'
import { selectBotKeywordsByKeywords } from '../../../utils/mysql-queries'
import type { TelegramClientWrapper } from './TelegramClientWrapper'

export const subscribeToKeyword = async (tgClient: TelegramClientWrapper, testKeyword: string) => {
  const mySubscriptionMenuUpdates = await tgClient.executeMessage(
    i18n['ru'].button.mySubscriptions(),
  )
  if (!mySubscriptionMenuUpdates) {
    throw new Error(`There are no updates after pressed «${i18n['ru'].button.mySubscriptions()}»`)
  }
  const menuMessage = mySubscriptionMenuUpdates.result.find(
    update => update.message.text === i18n['ru'].message.thereTopicsAndKeywords(),
  )
  if (!menuMessage) {
    throw new Error(
      `There is no subscription menu: ${JSON.stringify(mySubscriptionMenuUpdates, null, 2)}`,
    )
  }
  await tgClient.executeMessage(i18n['ru'].button.editKeywords())
  await tgClient.executeMessage(testKeyword)
  const db = await getDbConnection()
  const [keyword] = await selectBotKeywordsByKeywords(db, [testKeyword])
  await db.close()
  return keyword
}
