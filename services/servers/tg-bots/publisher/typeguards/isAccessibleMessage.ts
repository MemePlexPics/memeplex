import { InaccessibleMessage } from '@telegraf/types'
import { Message } from 'telegraf/typings/core/types/typegram'

export const isAccessibleMessage = (message: unknown): message is Message => {
  return (message as InaccessibleMessage).date !== 0
}
