import { mkdir } from 'fs/promises'

export const buildImagePath = async (meme: {
  channelName: string
  messageId: number
  photoId: number
}) => {
  const directory = './data/media/' + meme.channelName + '/'
  await mkdir(directory, { recursive: true })
  return directory + meme.messageId + '-' + meme.photoId + '.jpg'
}
