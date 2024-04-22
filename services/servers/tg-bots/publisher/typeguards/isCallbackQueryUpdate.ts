import { Update } from 'telegraf/typings/core/types/typegram'

export const isCallbackQueryUpdate = (update: unknown): update is Update.CallbackQueryUpdate => {
  return 'callback_query' in (update as Update.CallbackQueryUpdate)
}
