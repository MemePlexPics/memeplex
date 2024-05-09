import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { getDbConnection } from '../../../utils'
import { AMQP_MEMES_TO_NLP_CHANNEL } from '../../../constants'
import { getPublisherKeywords, selectPublisherKeywordGroups } from '../../../utils/mysql-queries'
import { TMemeEntity } from '../../types'

export const handlePublisherDistribution = async (document: TMemeEntity, memeId: string) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const sendMemeDataToNlpCh = await amqp.createChannel()
  const db = await getDbConnection()
  const keywords = await getPublisherKeywords(db)
  const keywordGroups = await selectPublisherKeywordGroups(db)
  const groupsByKeyword = keywordGroups.reduce<Record<string, string[]>>(
    (obj, { name, keywords }) => {
      keywords.split(', ').forEach(keyword => {
        if (!obj[keyword]) obj[keyword] = []
        obj[keyword].push(name)
      })
      return obj
    },
    {},
  )
  const allKeywords = new Set<string>()
  keywords.forEach(({ keyword }) => allKeywords.add(keyword))
  Object.keys(groupsByKeyword).forEach(keyword => allKeywords.add(keyword))

  sendMemeDataToNlpCh.sendToQueue(
    AMQP_MEMES_TO_NLP_CHANNEL,
    Buffer.from(
      JSON.stringify({
        memeId,
        memeData: document,
        keywords: [...allKeywords],
      }),
    ),
    { persistent: true },
  )
  await db.close()
}
