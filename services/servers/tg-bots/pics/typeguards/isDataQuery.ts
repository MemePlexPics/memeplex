import type { CallbackQuery } from 'telegraf/typings/core/types/typegram'

export const isDataQuery = (query: unknown): query is CallbackQuery.DataQuery => {
  return 'data' in (query as CallbackQuery.DataQuery)
}
