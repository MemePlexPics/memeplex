import type { Response } from 'express-serve-static-core'
import type { TResponseLocals } from '../types'

export type TResponse = Response<unknown, TResponseLocals>
