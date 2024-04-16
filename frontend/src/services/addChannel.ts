import { getUrl } from '../utils'

import { TNewChannel } from '@/types'

export const addChannel = async (channel: TNewChannel, password: string) => {
  const response = await fetch(getUrl('/admin/channel'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel,
      password,
    }),
  })
  return response
}
