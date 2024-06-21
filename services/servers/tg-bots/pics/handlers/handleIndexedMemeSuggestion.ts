import amqplib from 'amqplib'
import { eq } from 'drizzle-orm'
import { AMQP_INDEXED_SUGGESTED_MEME_TO_BOT_CHANNEL } from '../../../../../constants/amqpChannels'
import type { Telegraf } from 'telegraf'
import type { TTelegrafContext } from '../types'
import { getDbConnection } from '../../../../../utils'
import { botMemeSuggestions } from '../../../../../db/schema'
import type { TAmqpIndexedSuggestedMemeToBotChannelMessage } from '../../../../types'
import { i18n } from '../i18n'

export const handleIndexedMemeSuggestion = async (bot: Telegraf<TTelegrafContext>) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const indexedMemeSuggestionCh = await amqp.createChannel()
  await indexedMemeSuggestionCh.assertQueue(AMQP_INDEXED_SUGGESTED_MEME_TO_BOT_CHANNEL, {
    durable: true,
  })
  await indexedMemeSuggestionCh.prefetch(1)

  indexedMemeSuggestionCh.consume(AMQP_INDEXED_SUGGESTED_MEME_TO_BOT_CHANNEL, async msg => {
    if (msg === null) {
      return
    }
    // TODO: lets try .toJSON() instead of JSON.parse(.toString())
    const payload: TAmqpIndexedSuggestedMemeToBotChannelMessage = JSON.parse(msg.content.toString())
    const db = await getDbConnection()
    const [memeSuggestion] = await db
      .select()
      .from(botMemeSuggestions)
      .where(eq(botMemeSuggestions.publishedId, payload.publishedId))
    await bot.telegram.sendMessage(
      memeSuggestion.userId,
      i18n['ru'].message.memeSuggestionIndexed(),
      {
        reply_parameters: {
          message_id: memeSuggestion.messageId,
        },
      },
    )
  })
}
