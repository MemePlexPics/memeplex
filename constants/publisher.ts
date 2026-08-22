import process from 'process'
import 'dotenv/config'

export const MAX_FREE_USER_CHANNEL_SUBS = Number(process.env.MAX_FREE_USER_CHANNEL_SUBS)
export const PREMIUM_REQUEST_URL = 'https://t.me/memeplex_pics/56'

export const QUERY_REDUNDANT_WORDS = [
  'мем',
  'видео',
  'фото',
  'картинка',
  'где',
  'из',
  'reels',
  'рилс',
]

export const ADMIN_IDS = process.env.TELEGRAM_BOT_ADMIN_IDS.split(',').map(id => Number(id))
