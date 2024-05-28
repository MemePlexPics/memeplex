import type { Client } from '@elastic/elasticsearch'
import type { Logger } from 'winston'
import { getElasticClient, loopRetrying } from '.'

export const connectToElastic = async (logger: Logger) => {
  const getElasticClientUntilSuccess = async () => {
    let connect: Client | undefined
    await loopRetrying(
      async () => {
        connect = await getElasticClient()
        return true
      },
      { logger },
    )
    return connect
  }

  let client = await getElasticClientUntilSuccess()

  const reconnect = async () => {
    client = await getElasticClientUntilSuccess()
  }

  return {
    client,
    reconnect,
  }
}
