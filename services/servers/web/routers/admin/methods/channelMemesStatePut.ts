import { setChannelMemesState } from '../../../../utils'
import { setLogAction } from '../utils'
import { TRequestHandler } from '../types'

export const channelMemesStatePut: TRequestHandler<{
  channel: string
  state: 0 | 1
}> = async (req, res) => {
  const client = req.app.get('elasticClient')
  const { channel, state } = req.body
  if (!channel || !state || typeof channel !== 'string' || typeof state !== 'number')
    return res.status(500).send()
  await setChannelMemesState(client, channel, state)
  const emoji = {
    0: '👁‍',
    1: '🫣',
  }
  setLogAction(res, `${emoji[state]} ${channel}`)
  return res.send()
}
