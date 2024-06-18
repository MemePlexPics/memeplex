import { phashes } from '../../db/schema'
import type { TDbConnection } from '../types'

export async function insertPHash(db: TDbConnection, pHash: string) {
  await db.insert(phashes).values({
    phash: pHash,
  })
}
