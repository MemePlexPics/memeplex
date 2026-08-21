import { createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

export const downloadFile = async (url: string, dest: string) => {
  const response = await fetch(url)
  // The media server reports an unusable source (deleted post, no media, unknown peer) as a
  // 4xx with a free-form statusText, so retrying can never succeed. Matching those strings
  // individually meant every new wording became a message that blocked the queue forever.
  if (!response.ok) {
    if (response.status >= 500) throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    return null
  }
  // @ts-expect-error response.body is unknown type
  await pipelineAsync(response.body, createWriteStream(dest))
  console.log('💬 Download completed')
  return true
}
