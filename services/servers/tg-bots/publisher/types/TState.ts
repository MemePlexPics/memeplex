import { TInlineMenu, TMenu, TTelegrafContext } from '.'
import { Promisable } from '../../../../../types'

export type TState<GStateName> = {
  stateName: GStateName
  menu?: (ctx?: TTelegrafContext) => Promisable<TMenu>
  inlineMenu?: (ctx?: TTelegrafContext) => Promisable<TInlineMenu>
  message?: (ctx?: TTelegrafContext) => string
  onCallback?: <GCallback = GStateName>(ctx: TTelegrafContext, callback: GCallback) => unknown
  onText?: (ctx?: TTelegrafContext, text?: string) => unknown
}
