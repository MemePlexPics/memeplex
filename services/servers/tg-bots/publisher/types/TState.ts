import { TInlineMenu, TMenu, TTelegrafContext } from '.'
import { Promisable } from '../../../../../types'
import { EState } from '../constants'

export type TState<GStateName extends string = EState> = {
  stateName?: GStateName
  menu?: (ctx?: TTelegrafContext) => Promisable<TMenu>
  inlineMenu?: (ctx?: TTelegrafContext) => Promisable<TInlineMenu>
  message?: (ctx?: TTelegrafContext) => Promisable<string>
  onCallback?: <GCallback = GStateName>(
    ctx: TTelegrafContext,
    callback: GCallback,
  ) => Promisable<unknown>
  onText?: (ctx?: TTelegrafContext, text?: string) => Promisable<unknown>
}
