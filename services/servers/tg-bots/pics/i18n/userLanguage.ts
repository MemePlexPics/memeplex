import { eq } from 'drizzle-orm'
import { botUserLanguages } from '../../../../../db/schema'
import type { TDbConnection } from '../../../../../utils/types'
import { resolveLanguage } from '.'

export const saveUserLanguage = async (
  db: TDbConnection,
  userId: number,
  languageCode?: string,
) => {
  const language = resolveLanguage(languageCode)
  await db
    .insert(botUserLanguages)
    .values({ userId, language })
    .onDuplicateKeyUpdate({ set: { language } })
}

export const getUserLanguage = async (db: TDbConnection, userId: number) => {
  const [row] = await db.select().from(botUserLanguages).where(eq(botUserLanguages.userId, userId))
  return resolveLanguage(row?.language)
}
