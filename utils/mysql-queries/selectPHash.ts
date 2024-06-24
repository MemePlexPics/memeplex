import { eq } from 'drizzle-orm'
import { phashes } from '../../db/schema'
import type { TDbConnection } from '../types'

export async function selectPHash(db: TDbConnection, pHash: string) {
  const [result] = await db.select().from(phashes).where(eq(phashes.phash, pHash))
  return result
}
