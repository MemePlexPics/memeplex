import { Client } from '@elastic/elasticsearch'
import { Logger } from 'winston'
import { getElasticClient, loopRetrying } from '.'

export const connectToElastic = async (logger: Logger) => {
  const getElasticClientUntilSuccess = async () => {
    let connect: Client
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
