import process from 'process'
import 'dotenv/config'
import { handleDistributionQueue, handleInvoiceQueue, handleNlpQueue, init } from './utils'
import { loopRetrying } from '../../../../utils'
import { CYCLE_SLEEP_TIMEOUT, LOOP_RETRYING_DELAY } from '../../../../constants'
import { i18n } from './i18n'
import { getLogger } from '../utils'

const start = async () => {
  const logger = getLogger('tg-publisher-bot')
  const bot = await init(
    process.env.TELEGRAM_PUBLISHER_BOT_TOKEN,
    {
      telegram: {
        webhookReply: false,
      },
    },
    logger,
  )

  bot.launch({
    webhook: {
      domain: process.env.MEMEPLEX_WEBSITE_DOMAIN,
      path: '/' + process.env.TELEGRAM_PUBLISHER_BOT_WEBHOOK_PATH,
      port: 3082,
    },
  })

  bot.telegram.setMyCommands([
    {
      command: 'menu',
      description: i18n['ru'].command.callCurrentMenu(),
    },
    {
      command: 'help',
      description: i18n['ru'].command.help(),
    },
  ])
  bot.telegram.setMyDescription(`
    Это description
  `)
  bot.telegram.setMyShortDescription(`
    Это short description
  `)
  logger.info({ info: 'Telegram bot started' })

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))

  loopRetrying(() => handleNlpQueue(logger), {
    logger: logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
  })
  loopRetrying(() => handleDistributionQueue(bot, logger), {
    logger: logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
  })
  loopRetrying(() => handleInvoiceQueue(bot, logger), {
    logger: logger,
    afterCallbackDelayMs: CYCLE_SLEEP_TIMEOUT,
    catchDelayMs: LOOP_RETRYING_DELAY,
  })
}

await start()
