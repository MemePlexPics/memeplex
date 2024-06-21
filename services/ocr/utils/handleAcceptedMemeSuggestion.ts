import amqplib from 'amqplib'
import { eq } from 'drizzle-orm'
import { botMemeSuggestions } from '../../../db/schema'
import { getDbConnection } from '../../../utils'
import { AMQP_INDEXED_SUGGESTED_MEME_TO_BOT_CHANNEL } from '../../../constants/amqpChannels'
import type { TAmqpIndexedSuggestedMemeToBotChannelMessage } from '../../types'

export const handleAcceptedMemeSuggestion = async (messageId: number) => {
  const db = await getDbConnection()
  const [memeSuggestion] = await db
    .select()
    .from(botMemeSuggestions)
    .where(eq(botMemeSuggestions.publishedId, messageId))
  await db.close()
  if (memeSuggestion) {
    const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
    const sendAcceptedSuggestionToBotCh = await amqp.createChannel()
    const content: TAmqpIndexedSuggestedMemeToBotChannelMessage = {
      publishedId: messageId,
    }
    sendAcceptedSuggestionToBotCh.sendToQueue(
      AMQP_INDEXED_SUGGESTED_MEME_TO_BOT_CHANNEL,
      Buffer.from(JSON.stringify(content)),
      { persistent: true },
    )
    await sendAcceptedSuggestionToBotCh.close()
    await amqp.close()
  }
}
