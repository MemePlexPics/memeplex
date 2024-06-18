import 'dotenv/config'
import process from 'process'

export const buildImageUrl = (meme: {
  channelName: string
  messageId: number
  photoId: number
}) => {
  return (
    process.env.TG_RSS_ENDPOINT +
    '/media/' +
    meme.channelName +
    '/' +
    meme.messageId +
    '/' +
    meme.photoId +
    '_x_0.jpg'
  )
}
