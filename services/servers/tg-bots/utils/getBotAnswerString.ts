export const getBotAnswerString = (meme: { channel: string; messageId: number }) => {
  const tgLink = `https://t.me/${meme.channel}/${meme.messageId}` as const
  return `[${tgLink}](${tgLink})` as const
}
