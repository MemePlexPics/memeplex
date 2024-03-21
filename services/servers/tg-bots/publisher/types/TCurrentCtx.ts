import { DefaultCtx, GenericMenu } from 'telegraf-menu'

export type TCurrentCtx = DefaultCtx & {
  session: {
    keyboardMenu: GenericMenu
    channel?: string
    state: string
  }
}
