import { TInlineMenu, TMenuButton, TTelegrafContext } from '.'

export type TState<GStateName> = {
  stateName: GStateName
  menu?: (ctx?: TTelegrafContext) => Promise<TMenuButton[][]> | TMenuButton[][]
  inlineMenu?: (ctx?: TTelegrafContext) => Promise<TInlineMenu> | TInlineMenu
  message?: (ctx?: TTelegrafContext) => string
  onCallback?: <GCallback = GStateName>(ctx: TTelegrafContext, callback: GCallback) => unknown
  onText?: (ctx?: TTelegrafContext, text?: string) => unknown
}
