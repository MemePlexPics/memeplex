import fs from 'fs'
import { getElasticClient } from '../utils'
import { ELASTIC_INDEX, wordsForElasticEntititesCounter } from '../constants'
import { Client } from '@elastic/elasticsearch'

const countEntities = async (client: Client, words: string[]) => {
  const query = {
    query: {
      bool: {
        should: words.map(word => ({
          match: {
            eng: word,
          },
        })),
        minimum_should_match: 1,
      },
    },
  }

  const response = await client.count({
    index: ELASTIC_INDEX,
    body: query,
  })

  return response.count
}

const processMultilineString = async (multilineString: string, client: Client) => {
  const result: { [key: string]: number } = {}
  const lines = multilineString.split('\n')

  for (const line of lines) {
    if (line.trim()) {
      const words = line.split(/,\s*/)
      const count = await countEntities(client, words)
      result[line] = count
    }
  }

  return result
}

const saveResultToFile = (result: { [key: string]: number }, filePath: string) => {
  const json = JSON.stringify(result, null, 2)
  fs.writeFileSync(filePath, json, 'utf-8')
}

const main = async () => {
  const client = await getElasticClient()

  const result = await processMultilineString(wordsForElasticEntititesCounter, client)

  const jsonFilePath = './data/counted-words.json'
  saveResultToFile(result, jsonFilePath)
  console.log(`Results saved to ${jsonFilePath}`)
}

main()
