import process from 'process'
import 'dotenv/config'

export const getTelegramFileInfo = async (file_id: string) => {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getFile?file_id=${file_id}`
  const fileInfo = await fetch(url)
  return await fileInfo.json()
}
