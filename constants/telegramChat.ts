export const telegramChat: Record<string, number | `@${string}`> = {
  premoderation: parseInt(process.env.TELEGRAM_CHAT_MEME_PREMODERATION)
    ? Number(process.env.TELEGRAM_CHAT_MEME_PREMODERATION)
    : (process.env.TELEGRAM_CHAT_MEME_PREMODERATION as `@${string}`),
  memes: parseInt(process.env.TELEGRAM_CHAT_MEME_PUBLICATION)
    ? Number(process.env.TELEGRAM_CHAT_MEME_PUBLICATION)
    : (process.env.TELEGRAM_CHAT_MEME_PUBLICATION as `@${string}`),
}
