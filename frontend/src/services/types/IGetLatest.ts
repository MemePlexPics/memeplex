import { IGetSearch } from '.'

export type IGetLatest = {
  from: number | undefined
  to: number | undefined
} & IGetSearch
