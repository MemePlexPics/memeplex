import 'dotenv/config'
import { promises as fs } from 'fs'
// @ts-expect-error no type definitions
import * as imghash from 'imghash'
import { selectPHash, insertPHash } from '../../../utils/mysql-queries'
import { checkFileExists, downloadFile, getDbConnection } from '../../../utils'
import { buildImageUrl } from '.'
import type { Logger } from 'winston'
import type { TAmqpImageDataChannelMessage } from '../../types'

export const isFileIgnored = async (
  logger: Logger,
  destination: string,
  payload: TAmqpImageDataChannelMessage,
) => {
  const doesImageExist = await checkFileExists(destination)

  if (doesImageExist) {
    logger.verbose(`Image already exists: ${destination}`)
    return true
  }

  const url = buildImageUrl(payload)
  logger.verbose(`downloading: ${url} -> ${destination}`)
  // Check if a message has been deleted from a channel
  const isEmpty = (await downloadFile(url, destination)) === null
  if (isEmpty) return true

  // compute pHash
  const pHash = await imghash.hash(destination)

  const db = await getDbConnection()
  // check if this pHash exists
  const doesExist = await selectPHash(db, pHash)
  // ocr.space has a limit of 1024 KB
  const fileSize = (await fs.stat(destination)).size
  if (doesExist || fileSize > 1048576) {
    // if we have seen this phash, skip the image and remove
    // the downloaded file
    await fs.unlink(destination)
    return true
  }
  await insertPHash(db, pHash)
  await db.close()
  return false
}
