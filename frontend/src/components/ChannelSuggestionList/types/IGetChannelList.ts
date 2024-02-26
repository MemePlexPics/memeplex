import { IGetChannelListEntity } from "."

export interface IGetChannelList {
    result: IGetChannelListEntity[],
    totalPages: number
}
