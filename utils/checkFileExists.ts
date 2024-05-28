import type { PathLike } from 'fs'
import { promises as fs } from 'fs'

export async function checkFileExists(file: PathLike) {
  try {
    await fs.access(file)
    return true // The file exists
  } catch {
    return false // The file does not exist
  }
}
