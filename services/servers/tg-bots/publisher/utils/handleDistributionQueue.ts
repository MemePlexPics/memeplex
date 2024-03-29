import amqplib from 'amqplib'
import { Telegraf } from "telegraf"
import { TTelegrafContext } from "../types"
import process from 'process'
import { getAmqpQueue } from '../../../../utils'
import { AMQP_PUBLISHER_DISTRIBUTION_CHANNEL, EMPTY_QUEUE_RETRY_DELAY } from '../../../../../constants'
import { delay, getMysqlClient } from '../../../../../utils'
import { Logger } from 'winston'
import { TPublisherDistributionQueueMsg } from '../../../../ocr/types'
import fs from 'fs/promises'
import { drizzle } from 'drizzle-orm/mysql2'
import { botPublisherChannels } from '../../../../../db/schema'
import { inArray } from 'drizzle-orm'
import { Key } from 'telegram-keyboard'

export const handleDistributionQueue = async (bot: Telegraf<TTelegrafContext>, logger: Logger) => {
    const amqp = await amqplib.connect(process.env.AMQP_ENDPOINT);
    const [
        distributionCh,
        distributionTimeout,
        // distributionTimeotClear
    ] = await getAmqpQueue(amqp, AMQP_PUBLISHER_DISTRIBUTION_CHANNEL)

    for (;;) {
        const msg = await distributionCh.get(AMQP_PUBLISHER_DISTRIBUTION_CHANNEL);
        if (!msg) {
            await delay(EMPTY_QUEUE_RETRY_DELAY);
            continue;
        }
        const payload = JSON.parse(msg.content.toString()) as TPublisherDistributionQueueMsg;
        distributionTimeout(600_000, logger, msg);

        const buttons = []

        const db = drizzle(await getMysqlClient())

        const channels = await db.select().from(botPublisherChannels).where(inArray(botPublisherChannels.id, payload.channelIds))

        channels.forEach(channel => buttons.push([
            Key.callback(`✅ ${channel.username}`, channel.id)
        ]))

        payload.keywords.forEach(keyword => buttons.push([
            Key.callback(`🗑️ ${keyword}`, keyword)
        ]))

        try {
            await bot.telegram.sendPhoto(payload.userId, {
                source: await fs.readFile(payload.document.fileName),
            }, {
                reply_markup: {
                    inline_keyboard: buttons,
                }
            })
            distributionCh.ack(msg)
        } catch (e) {
            logger.error(e)
            distributionCh.nack(msg)
            await delay(1000);
        }
    }
}
