import process from 'process'
import 'dotenv/config'
import { downloadFile } from '../../../utils'

export const downloadTelegramFile = async (channel: string, file_path: string) => {
  const url = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file_path}`
  const destination = `./data/avatars/${channel}.jpg`
  const isDownloaded = await downloadFile(url, destination)
  if (!isDownloaded) return null
  return destination
}
