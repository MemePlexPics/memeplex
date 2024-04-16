import { TAmqpImageDataChannelMessage } from '.'

export type TAmqpImageFileChannelMessage = TAmqpImageDataChannelMessage & {
  fileName: string
}
