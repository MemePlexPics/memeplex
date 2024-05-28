import type { Update } from 'telegraf/typings/core/types/typegram'

export const isMessageUpdate = (update: unknown): update is Update.MessageUpdate => {
  return 'message' in (update as Update.MessageUpdate)
}
