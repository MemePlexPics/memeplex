import axios from 'axios'

export const sendToLoki = async (stream: { [name: string]: string }, messages: string[]) => {
  const datetime = Date.now() * 1000 * 1000
  const response = await axios.post('http://localhost:3100/loki/api/v1/push', {
    streams: [
      {
        stream,
        values: messages.map(message => [String(datetime), message]),
      },
    ],
  })
  return response.status === 204
}
