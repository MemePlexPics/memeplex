import { TInlineMenu, TMenu, TTelegrafContext } from "."
import { Promisable } from "../../../../../types"
import { EState } from "../constants"

export type TStateObject<GStateName = EState> = {
  stateName: GStateName
  menu?: (ctx?: TTelegrafContext) => Promisable<TMenu>
  inlineMenu?: (ctx?: TTelegrafContext) => Promisable<TInlineMenu>
  message?: (ctx?: TTelegrafContext) => string
  onCallback?: <GCallback = GStateName>(ctx: TTelegrafContext, callback: GCallback) => unknown
  onText?: (ctx?: TTelegrafContext, text?: string) => unknown
}
