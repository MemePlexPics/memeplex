import amqplib from 'amqplib'
import type { Telegraf } from 'telegraf'
import type { TTelegrafContext } from '../types'
import process from 'process'
import 'dotenv/config'
import { getAmqpQueue } from '../../../../utils'
import {
  AMQP_PUBLISHER_DISTRIBUTION_CHANNEL,
  EMPTY_QUEUE_RETRY_DELAY,
} from '../../../../../constants'
import { delay, getDbConnection, logError, logInfo } from '../../../../../utils'
import type { Logger } from 'winston'
import fs from 'fs/promises'
import {
  selectBotChannelsById,
  selectBotTopicNameByIds,
  selectBotKeywordsByKeywords,
  selectBotPremiumUser,
} from '../../../../../utils/mysql-queries'
import { EKeywordAction, ETopicAction, callbackData } from '../constants'
import type { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram'
import type { TPublisherDistributionQueueMsg } from '../../../../types'
import { i18n } from '../i18n'
import type { ExtraReplyMessage } from 'telegraf/typings/telegram-types'

export const handleDistributionQueue = async (
  bot: Telegraf<TTelegrafContext>,
  logger: Logger,
  abortSignal: AbortSignal,
) => {
  const isTesting = process.env.ENVIRONMENT === 'TESTING'
  const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT)
  const [distributionCh, distributionTimeout, distributionTimeotClear] = await getAmqpQueue(
    amqp,
    AMQP_PUBLISHER_DISTRIBUTION_CHANNEL,
  )

  try {
    for (;;) {
      if (abortSignal.aborted) {
        logger.info({ info: 'Loop aborted' })
        break
      }
      const msg = await distributionCh.get(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL)
      if (!msg) {
        await delay(EMPTY_QUEUE_RETRY_DELAY)
        continue
      }
      distributionTimeout(600_000, logger, msg)
      const payload = JSON.parse(msg.content.toString()) as TPublisherDistributionQueueMsg

      const buttons: InlineKeyboardButton.CallbackButton[][] = []
      const db = await getDbConnection()
      const channels = await selectBotChannelsById(db, payload.channelIds)
      const [userPremium] = await selectBotPremiumUser(db, payload.userId)

      channels.forEach(channel => {
        if (channel.id === Number(payload.userId)) return null
        buttons.push([
          {
            text: i18n['ru'].button.postMeme(channel.username),
            callback_data: callbackData.premoderation.postButton(channel.id, payload.memeId),
          },
        ])
      })

      // TODO: maybe it is worth refactoring
      if (payload.keywords.length !== 0) {
        const keywords = await selectBotKeywordsByKeywords(db, payload.keywords)
        keywords.forEach(({ id, keyword }) => {
          const channelId =
            payload.channelIdsByKeyword[keyword]?.length > 1
              ? payload.channelIdsByKeyword[keyword].find(channelId => channelId !== payload.userId)
              : payload.channelIdsByKeyword[keyword][0]
          if (!channelId) {
            throw new Error(`There is a message without a single channelId!`)
          }
          buttons.push([
            {
              text: i18n['ru'].button.premoderation.keyword.unsubscribe(keyword),
              callback_data: callbackData.premoderation.keywordButton(
                EKeywordAction.DELETE,
                channelId,
                id,
              ),
            },
          ])
        })
      }

      if (payload.topicIds.length !== 0) {
        const topics = await selectBotTopicNameByIds(db, payload.topicIds)
        topics.forEach(({ id, name: topicName }) => {
          if (!topicName || !id) {
            return
          }
          const channelId =
            payload.channelIdsByTopic[id]?.length > 1
              ? payload.channelIdsByTopic[id].find(channelId => channelId !== payload.userId)
              : payload.channelIdsByTopic[id][0]
          if (!channelId) {
            throw new Error(`There is a message without a single channelId!`)
          }
          buttons.push([
            {
              text: i18n['ru'].button.premoderation.topic.unsubscribe(topicName),
              callback_data: callbackData.premoderation.topicButton(
                ETopicAction.UNSUBSCRIBE,
                channelId,
                id,
              ),
            },
          ])
        })
      }

      const topicKeywords = Object.entries(payload.topicKeywords)
      if (topicKeywords.length !== 0) {
        const [keywordList, topicIdList] = topicKeywords.reduce<[string[], number[]]>(
          (acc, [keyword, topic]) => {
            acc[0].push(keyword)
            acc[1].push(topic)
            return acc
          },
          [[], []],
        )
        const keywords = await selectBotKeywordsByKeywords(db, keywordList)
        const topics = await selectBotTopicNameByIds(db, topicIdList)
        const keywordIdsObject = keywords.reduce<Record<string, number>>((acc, { id, keyword }) => {
          acc[keyword] = id
          return acc
        }, {})
        const topicNameById = topics.reduce<Record<number, string>>((acc, { id, name }) => {
          if (!name || !id) return acc
          acc[id] = name
          return acc
        }, {})
        topicKeywords.forEach(async ([keyword, topicId]) => {
          const channelId =
            payload.channelIdsByKeyword[keyword]?.length > 1
              ? payload.channelIdsByKeyword[keyword].find(channelId => channelId !== payload.userId)
              : payload.channelIdsByKeyword[keyword][0]
          if (!channelId) {
            throw new Error(`There is a message without a single channelId!`)
          }
          buttons.push([
            {
              text: i18n['ru'].button.premoderation.keywordFromTopic.unsubscribe(
                userPremium !== undefined,
                keyword,
                topicNameById[topicId],
              ),
              callback_data: callbackData.premoderation.topicKeywordsButton(
                EKeywordAction.DELETE,
                channelId,
                keywordIdsObject[keyword],
                topicId,
              ),
            },
          ])
        })
      }
      await db.close()

      try {
        const sourceLink = `[источник](https://t.me/${payload.document.channelName}/${payload.document.messageId})`
        const webLink = `[web](https://${process.env.MEMEPLEX_WEBSITE_DOMAIN}/memes/${payload.memeId})`
        const botLink = `[bot](https://t.me/MemePlexPublisherBot?start=fw)`
        const text = [sourceLink, webLink, botLink].join('            /            ')
        const messageParams: ExtraReplyMessage = {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: buttons,
          },
        }
        // TelegramTestApi return http.status == 500 on sendPhoto()
        if (isTesting) {
          await bot.telegram.sendMessage(payload.userId, text, messageParams)
        } else {
          await bot.telegram.sendPhoto(
            payload.userId,
            {
              source: await fs.readFile(payload.document.fileName),
            },
            {
              ...messageParams,
              caption: text,
            },
          )
        }
        distributionCh.ack(msg)
      } catch (e) {
        if (e instanceof Error) {
          if (e.message.includes('403')) {
            await logInfo(logger, e)
            distributionCh.ack(msg)
            continue
          }
          await logError(logger, e)
        }
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
