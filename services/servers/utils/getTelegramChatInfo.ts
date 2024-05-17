import process from 'process'
import 'dotenv/config'

export const getTelegramChatInfo = async (name: string) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChat?chat_id=@${name}`
  const chatInfo = await fetch(url)
  return await chatInfo.json()
}
