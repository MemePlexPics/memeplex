import type { SplitString } from '../../../../../types'

export type TSplitCallback<GCallback extends string> =
  SplitString<GCallback, '|'> extends [infer _GFirst, ...infer GRest] ? GRest : never
