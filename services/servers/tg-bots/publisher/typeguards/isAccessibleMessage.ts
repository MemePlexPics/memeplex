import type { InaccessibleMessage } from '@telegraf/types'
import type { Message } from 'telegraf/typings/core/types/typegram'

export const isAccessibleMessage = (message: unknown): message is Message => {
  return (message as InaccessibleMessage).date !== 0
}
