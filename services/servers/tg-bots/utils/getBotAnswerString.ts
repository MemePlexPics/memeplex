export const getBotAnswerString = (meme: { channel: string; message: string }) => {
  const tgLink = `https://t.me/${meme.channel}/${meme.message}`
  return `[${tgLink}](${tgLink})`
}
