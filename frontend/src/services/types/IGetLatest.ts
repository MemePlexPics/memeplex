import { IGetSearch } from "."

export interface IGetLatest extends IGetSearch {
    from: number | undefined
    to: number | undefined
}
