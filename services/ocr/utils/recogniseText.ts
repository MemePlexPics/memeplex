import fs from 'fs/promises'
import { recogniseTextOcrSpace, buildImageTextPath } from '.'
import type { Logger } from 'winston'
import type { TAmqpImageFileChannelMessage } from '../../types'

export const recogniseText = async (payload: TAmqpImageFileChannelMessage, logger: Logger) => {
  const texts: Record<string, string> = {}

  const rawText = await recogniseTextOcrSpace(payload.fileName, 'eng')

  if (rawText) {
    texts.eng = rawText
    const textFile = await buildImageTextPath(payload, 'eng')
    await fs.writeFile(textFile, rawText)
    logger.verbose(`recognized text: ${rawText}`)
  } else {
    logger.verbose(`text wasn't recognized: ${payload.fileName}`)
  }

  return texts
}
