import { TStateObject, TTelegrafContext } from '.'
import { Promisable } from '../../../../../types'

export type TState<GStateName extends string | undefined> = (ctx?: TTelegrafContext) => Promisable<TStateObject<GStateName>>
