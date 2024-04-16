import { TAmqpImageFileChannelMessage } from '../../types'

export type TBuildImageTextPath = (
  params: TAmqpImageFileChannelMessage,
  language: string,
) => Promise<string>
