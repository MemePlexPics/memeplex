import { eq } from 'drizzle-orm'
import { ocrKeysPro } from '../../db/schema'
import { TDbConnection } from '../types'

export async function updateProKeyTimeout(db: TDbConnection, key: string, timeout: string) {
  await db.update(ocrKeysPro).set({ timeout }).where(eq(ocrKeysPro.ocrKey, key))
}
