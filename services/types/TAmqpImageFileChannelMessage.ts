import type { TAmqpImageDataChannelMessage } from '.'

export type TAmqpImageFileChannelMessage = TAmqpImageDataChannelMessage & {
  fileName: string
}
