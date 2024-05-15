import amqplib from 'amqplib'
import { Telegraf } from 'telegraf'
import { TTelegrafContext } from '../types'
import process from 'process'
import 'dotenv/config'
import { getAmqpQueue } from '../../../../utils'
import {
  AMQP_PUBLISHER_DISTRIBUTION_CHANNEL,
  EMPTY_QUEUE_RETRY_DELAY,
} from '../../../../../constants'
import { delay, getDbConnection } from '../../../../../utils'
import { Logger } from 'winston'
import fs from 'fs/promises'
import { selectPublisherChannelsById } from '../../../../../utils/mysql-queries'
import { EKeywordAction, callbackData } from '../constants'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import { TPublisherDistributionQueueMsg } from '../../../../types'
import { i18n } from '../i18n'

export const handleDistributionQueue = async (bot: Telegraf<TTelegrafContext>, logger: Logger) => {
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const [distributionCh, distributionTimeout, distributionTimeotClear] = await getAmqpQueue(
    amqp,
    AMQP_PUBLISHER_DISTRIBUTION_CHANNEL,
  )

  try {
    for (;;) {
      const msg = await distributionCh.get(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL)
      if (!msg) {
        await delay(EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      distributionTimeout(600_000, logger, msg)
      const payload = JSON.parse(msg.content.toString()) as TPublisherDistributionQueueMsg

      const buttons: InlineKeyboardButton.CallbackButton[][] = []
      const db = await getDbConnection()
      const channels = await selectPublisherChannelsById(db, payload.channelIds)
      await db.close()

      channels.forEach(channel => {
        if (channel.id === Number(payload.userId)) return null
        buttons.push([
          {
            text: i18n['ru'].button.postMeme(channel.username),
            callback_data: callbackData.premoderationPostButton(channel.id, payload.memeId),
          },
        ])
      })

      payload.keywords.forEach(keyword => {
        const channelId =
          payload.channelIdsByKeyword[keyword].length !== 1
            ? payload.channelIdsByKeyword[keyword].find(channelId => channelId !== payload.userId)
            : payload.channelIdsByKeyword[keyword][0]
        buttons.push([
          {
            text: i18n['ru'].button.premoderationKeywordUnsubscribe(keyword),
            callback_data: callbackData.premoderationKeywordButton(
              EKeywordAction.DELETE,
              channelId,
              keyword,
            ),
          },
        ])
      })

      payload.keywordGroups.forEach(keywordGroup => {
        const channelId =
          payload.channelIdsByKeywordGroup[keywordGroup].length !== 1
            ? payload.channelIdsByKeywordGroup[keywordGroup].find(
              channelId => channelId !== payload.userId,
            )
            : payload.channelIdsByKeywordGroup[keywordGroup][0]
        buttons.push([
          {
            text: i18n['ru'].button.premoderationKeywordGroupUnsubscribe(keywordGroup),
            callback_data: callbackData.premoderationKeywordGroupButton(
              EKeywordAction.DELETE,
              channelId,
              keywordGroup,
            ),
          },
        ])
      })

      Object.entries(payload.groupKeywords).forEach(([keyword, keywordGroup]) => {
        const channelId =
          payload.channelIdsByKeyword[keyword].length !== 1
            ? payload.channelIdsByKeyword[keyword].find(channelId => channelId !== payload.userId)
            : payload.channelIdsByKeyword[keyword][0]
        if (!channelId) {
          throw new Error(`There is a message without a single channelId!`)
        }
        buttons.push([
          {
            text: i18n['ru'].button.premoderationKeywordFromGroupUnsubscribe(keyword, keywordGroup),
            callback_data: callbackData.premoderationGroupKeywordsButton(
              EKeywordAction.DELETE,
              channelId,
              keyword,
              keywordGroup,
            ),
          },
        ])
      })

      try {
        const sourceLink = `[источник](https://t.me/${payload.document.channelName}/${payload.document.messageId})`
        const webLink = `[web](https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/memes/${payload.memeId})`
        const botLink = `[bot](https://t.me/MemePlexPublisherBot?start=fw)`
        await bot.telegram.sendPhoto(
          payload.userId,
          {
            source: await fs.readFile(payload.document.fileName),
          },
          {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: buttons,
            },
            caption: [sourceLink, webLink, botLink].join('            /            '),
          },
        )
        distributionCh.ack(msg)
      } catch (e) {
        logger.error(e)
        distributionCh.nack(msg)
        await delay(1000)
      }
    }
  } finally {
    distributionTimeotClear()
    if (distributionCh) await distributionCh.close()
    if (amqp) await amqp.close()
  }
}
