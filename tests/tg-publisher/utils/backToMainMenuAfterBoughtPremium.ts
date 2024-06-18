import type { KeyboardButton } from 'telegraf/typings/core/types/typegram'
import { i18n } from '../../../services/servers/tg-bots/pics/i18n'
import type { TelegramClientWrapper } from '.'

export const backToMainMenuAfterBoughtPremium = async (tgClient: TelegramClientWrapper) => {
  // await tgClient.executeMessage(i18n['ru'].button.back(), undefined, false)
  // const mainMenuUpdates = await tgClient.executeCommand('/menu')
  const mainMenuUpdates = await tgClient.executeMessage(i18n['ru'].button.back())
  const extendPremiumButton = mainMenuUpdates?.result.find(update =>
    update.message.reply_markup?.keyboard?.find?.((row: KeyboardButton[]) =>
      row.find(button => button === i18n['ru'].button.extendPremium()),
    ),
  )
  expect(extendPremiumButton).not.toBe(undefined)
}
