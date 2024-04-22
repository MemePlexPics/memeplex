import { InaccessibleMessage } from '@telegraf/types'
import { Message } from 'amqplib'

export const isAccessibleMessage = (message: unknown): message is Message => {
  return (message as InaccessibleMessage).date !== 0
}
