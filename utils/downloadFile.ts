import { createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

export const downloadFile = async (url: string, dest: string) => {
  const response = await fetch(url)
  if (
    response.statusText === 'Empty message' ||
    response.statusText === 'Undefined array key "sizes"' || // f.e. https://t.me/bonedpizza/118877
    // the channel had to be disabled, but the images were there
    response.statusText === 'This peer is not present in the internal peer database'
  )
    return null
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  // @ts-expect-error response.body is unknown type
  await pipelineAsync(response.body, createWriteStream(dest))
  console.log('💬 Download completed')
  return true
}
