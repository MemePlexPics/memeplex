import 'dotenv/config'
import { Client } from '@elastic/elasticsearch'
import { promises as fs } from 'fs'

export const getElasticClient = async () => {
  const client = new Client({
    node: process.env.ELASTIC_ENDPOINT,
    auth: {
      username: process.env.ELASTIC_USERNAME,
      password: process.env.ELASTIC_PASSWORD,
    },
    tls: {
      key: await fs.readFile('./certs/elastic-certificates.key'),
      cert: await fs.readFile('./certs/elastic-certificates.crt'),
      ca: await fs.readFile('./certs/elastic-stack-ca.pem'),
      rejectUnauthorized: true,
    },
  })
  return client
}
