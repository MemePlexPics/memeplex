import { RequestHandler } from 'express'
import { ParamsDictionary, Query } from 'express-serve-static-core'
import { TResponseLocals } from './TResponseLocals'

export type TRequestHandler<TRequestBody = unknown, TResponseBody = unknown> = RequestHandler<
ParamsDictionary,
TResponseBody,
TRequestBody,
Query,
TResponseLocals
>
