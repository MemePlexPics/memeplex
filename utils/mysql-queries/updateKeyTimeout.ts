import { eq } from 'drizzle-orm'
import { ocrKeys } from '../../db/schema'
import { TDbConnection } from '../types'

export async function updateKeyTimeout(db: TDbConnection, key: string, timeout: string) {
  await db.update(ocrKeys).set({ timeout }).where(eq(ocrKeys.ocrKey, key))
}
