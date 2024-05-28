import amqplib from 'amqplib'
import process from 'process'
import 'dotenv/config'
import { getDbConnection } from '../../../utils'
import { AMQP_MEMES_TO_NLP_CHANNEL } from '../../../constants'
import { getPublisherKeywords } from '../../../utils/mysql-queries'
import type { TMemeEntity } from '../../types'

export const handlePublisherDistribution = async (document: TMemeEntity, memeId: string) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const sendMemeDataToNlpCh = await amqp.createChannel()
  const db = await getDbConnection()
  const keywords = await getPublisherKeywords(db)
  await db.close()
  const allKeywords = new Set<string>()
  keywords.forEach(({ keyword }) => allKeywords.add(keyword))

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
  await sendMemeDataToNlpCh.close()
  await amqp.close()
}
