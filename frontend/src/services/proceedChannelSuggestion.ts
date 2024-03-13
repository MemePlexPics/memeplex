import { getUrl } from '../utils'

export const proceedChannelSuggestion = async (channel: string, password: string) => {
  const response = await fetch(getUrl('/admin/channelSuggestion/proceed'), {
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
