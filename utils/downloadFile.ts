import { createWriteStream } from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

export const downloadFile = async (url, dest) => {
  const response = await fetch(url)
  if (
    response.statusText === 'Empty message' ||
    response.statusText.includes('Undefined array key "sizes"') // f.e. https://t.me/bonedpizza/118877
  )
    return null
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
  // @ts-expect-error response.body is unknown type
  await pipelineAsync(response.body, createWriteStream(dest))
  console.log('💬 Download completed')
  return true
}
