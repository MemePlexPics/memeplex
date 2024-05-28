import type { RequestHandler } from 'express'
import type { ParamsDictionary, Query } from 'express-serve-static-core'
import type { TResponseLocals } from './TResponseLocals'

export type TRequestHandler<TRequestBody = unknown, TResponseBody = unknown> = RequestHandler<
ParamsDictionary,
TResponseBody,
TRequestBody,
Query,
TResponseLocals
>
