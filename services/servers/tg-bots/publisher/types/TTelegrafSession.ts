import type { ChatFromGetChat } from 'telegraf/typings/core/types/typegram'
import type { EState } from '../constants'

export type TTelegrafSession = {
  channel?: {
    name: string
    id: number
    type: ChatFromGetChat['type']
  }
  state: EState
  premiumUntil?: number
  pagination?: {
    page: number
  }
}
