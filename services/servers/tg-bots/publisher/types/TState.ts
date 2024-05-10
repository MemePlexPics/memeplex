import { TInlineMenu, TMenu, TTelegrafContext } from '.'
import { Promisable } from '../../../../../types'
import { EState } from '../constants'

export type TState = {
  stateName: EState
  beforeInit?: (ctx: TTelegrafContext) => Promisable<boolean>
  menu?: (ctx: TTelegrafContext) => Promisable<TMenu>
  inlineMenu?: (ctx: TTelegrafContext) => Promisable<TInlineMenu>
  message?: (ctx: TTelegrafContext) => Promisable<string>
  onCallback?: (ctx: TTelegrafContext, callback: string) => Promisable<unknown>
  onText?: (ctx: TTelegrafContext, text: string) => Promisable<unknown>
}
