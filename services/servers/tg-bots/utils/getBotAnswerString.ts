export const getBotAnswerString = (meme: { channel: string; message: string }) => {
  const tgLink = `https://t.me/${meme.channel}/${meme.message}` as const
  return `[${tgLink}](${tgLink})` as const
}
