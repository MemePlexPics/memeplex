import process from 'process'
import 'dotenv/config'

export const MAX_FREE_USER_CHANNEL_SUBS = Number(process.env.MAX_FREE_USER_CHANNEL_SUBS)
export const PREMIUM_PLANS = [
  {
    months: 1,
    cost: Number(process.env.TELEGRAM_BOT_PREMIUM_COST_1M),
    emoji: '⭐',
  },
  {
    months: 3,
    cost: Number(process.env.TELEGRAM_BOT_PREMIUM_COST_3M),
    emoji: '✨',
  },
  {
    months: 12,
    cost: Number(process.env.TELEGRAM_BOT_PREMIUM_COST_12M),
    emoji: '🌟',
  },
] as const

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
