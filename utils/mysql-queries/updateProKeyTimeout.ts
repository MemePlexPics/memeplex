import { eq } from 'drizzle-orm'
import { ocrKeys, ocrKeysPro } from '../../db/schema'
import { TDbConnection } from '../types'

export async function updateProKeyTimeout(db: TDbConnection, key: string, timeout: string) {
  await db.update(ocrKeysPro).set({ timeout }).where(eq(ocrKeys.ocrKey, key))
}
