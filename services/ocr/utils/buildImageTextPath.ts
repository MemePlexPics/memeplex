import { mkdir } from 'fs/promises'
import type { TBuildImageTextPath } from '../types'

export const buildImageTextPath: TBuildImageTextPath = async (
  { channelName, messageId, photoId },
  language,
) => {
  const directory = './data/media/' + channelName + '/'
  await mkdir(directory, { recursive: true })
  return directory + messageId + '-' + photoId + '-' + language + '.txt'
}
