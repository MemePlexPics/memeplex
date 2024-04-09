import fs from 'fs/promises'
import { recogniseTextOcrSpace, buildImageTextPath } from '.'
import { GetMessage } from 'amqplib'
import { Logger } from 'winston'
import { TMemeEntity } from '../types'

export const recogniseText = async (msg: GetMessage, logger: Logger) => {
  // TODO: type for payloads / type amqp (?)
  const payload: TMemeEntity & {
    languages: string[]
    photoId: string
  } = JSON.parse(msg.content.toString())

  // ocr using all the languages
  const texts: Record<string, string> = {}

  for (const language of payload.languages) {
    const rawText = await recogniseTextOcrSpace(payload.fileName, language)

    if (rawText) {
      texts[language] = rawText
      const textFile = await buildImageTextPath(payload, language)
      await fs.writeFile(textFile, rawText)
      logger.verbose(`recognized text: ${rawText}`)
    } else {
      logger.verbose(`text wasn't recognized: ${payload.fileName}`)
    }
  }

  return {
    payload,
    texts,
  }
}
